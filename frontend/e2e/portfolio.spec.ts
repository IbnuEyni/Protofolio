import { test, expect, type Page } from "@playwright/test";

// Expects the seeded dataset from backend/seed.py.

async function openHome(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Amir" })).toBeVisible();
}

test.describe("content", () => {
  test("renders every section from the API", async ({ page }) => {
    await openHome(page);
    for (const id of ["experience", "projects", "skills", "performance", "education", "contact"]) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
    await expect(page.locator("#experience")).toContainText("10 Academy");
    await expect(page.locator("#projects")).toContainText("Oracle Forge");
    await expect(page.locator("#skills")).toContainText("LangGraph");
    await expect(page.getByText("No projects match")).toHaveCount(0);
  });

  test("skills are grouped by experience tier, not dot ratings", async ({ page }) => {
    await openHome(page);
    const skills = page.locator("#skills");
    for (const tier of ["Daily driver", "Shipped in production", "Working knowledge"]) {
      await expect(skills.getByRole("heading", { name: tier })).toBeVisible();
    }
    // Python is used by most projects; its pill says which ones to screen readers
    await expect(skills.getByRole("listitem").filter({ hasText: /^Python/ })).toContainText("used in Oracle Forge");
  });

  test("featured projects show an architecture diagram", async ({ page }) => {
    await openHome(page);
    await expect(page.getByRole("img", { name: /^Architecture: AST analysis, PDF parsing, Diagram vision → Prosecutor/ }))
      .toBeVisible();
    await expect(page.getByRole("img", { name: /NEW → EMAILED → REPLIED → QUALIFIED → BOOKED/ })).toBeVisible();
  });

  test("résumé is downloadable as a PDF", async ({ request }) => {
    const res = await request.get("/resume.pdf");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/pdf");
  });
});

test.describe("dialogs", () => {
  test("project details open, close on Escape, and return focus", async ({ page }) => {
    await openHome(page);
    const card = page.getByRole("button", { name: /— view details$/ }).first();
    await card.scrollIntoViewIfNeeded();
    await card.focus();
    await page.keyboard.press("Enter");

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Close" })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(card).toBeFocused();
  });

  test("experience details open and close", async ({ page }) => {
    await openHome(page);
    await page.getByRole("button", { name: /at 10 Academy — view details/ }).click();
    const dialog = page.getByRole("dialog", { name: "AI Agent Systems Engineer" });
    await expect(dialog).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(dialog).toHaveCount(0);
  });
});

test.describe("chat assistant", () => {
  test("answers through the API and closes on Escape", async ({ page }) => {
    // stub the LLM-backed endpoint so the test needs no API key
    await page.route("**/api/chat", (route) =>
      route.fulfill({ json: { answer: "Amir builds multi-agent systems.", lang: "en", sources: ["10 Academy"] } })
    );
    await openHome(page);

    const fab = page.getByRole("button", { name: "Open Ask-My-CV chat" });
    await expect(fab).toBeVisible({ timeout: 10_000 }); // mounted once the browser is idle
    await fab.click();
    const chat = page.getByRole("dialog", { name: "Ask-My-CV chat" });
    await expect(chat).toBeVisible();

    const input = page.getByRole("textbox", { name: /Ask a question/ });
    await expect(input).toBeEnabled({ timeout: 5_000 }); // boot sequence
    await input.fill("What does Amir do?");
    await input.press("Enter");
    await expect(chat).toContainText("Amir builds multi-agent systems.", { timeout: 10_000 });
    await expect(chat).toContainText("10 Academy");

    await page.keyboard.press("Escape");
    await expect(chat).toHaveCount(0);
  });
});

test.describe("accessibility", () => {
  test("first Tab reaches the skip link", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard navigation is a desktop concern");
    await openHome(page);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  });

  test("reduced motion shows final numbers immediately", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await openHome(page);
    await page.locator("#performance").scrollIntoViewIfNeeded();
    await expect(page.locator("#performance")).toContainText("35.2%");
    await expect(page.locator("#performance")).toContainText("$0.02");
    await ctx.close();
  });
});

test.describe("performance regressions", () => {
  // Regression: CSS `transition-all` on framer-animated cards restarted a
  // transform transition on every frame of the entrance animation (~280
  // restarts during load). Nothing is hovered here, so there should be ~none.
  test("entrance animations don't fight CSS transitions", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __runs: number }).__runs = 0;
      document.addEventListener("transitionrun", () => { (window as unknown as { __runs: number }).__runs++; }, true);
    });
    await openHome(page);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000); // covers every card's staggered entrance
    const runs = await page.evaluate(() => (window as unknown as { __runs: number }).__runs);
    expect(runs).toBeLessThan(10);
  });
});

test.describe("SEO and headers", () => {
  test("robots, sitemap, social image and structured data", async ({ page, request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /admin");
    expect((await request.get("/sitemap.xml")).status()).toBe(200);
    const og = await request.get("/opengraph-image");
    expect(og.headers()["content-type"]).toContain("image/png");

    await openHome(page);
    const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
    expect(ld).toMatchObject({ "@type": "Person", name: "Amir Ahmedin Temam" });
  });

  test("security headers are set and admin is not indexable", async ({ request }) => {
    const home = await request.get("/");
    expect(home.headers()["x-frame-options"]).toBe("DENY");
    expect(home.headers()["x-content-type-options"]).toBe("nosniff");
    expect(home.headers()["x-powered-by"]).toBeUndefined();
    const admin = await request.get("/admin/login");
    expect(admin.headers()["x-robots-tag"]).toContain("noindex");
  });
});
