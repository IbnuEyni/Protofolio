import { test, expect, type Page } from "@playwright/test";

// Needs the backend's ADMIN_TOKEN (CI sets it for the whole job). Desktop only:
// the CMS isn't a phone UI, and login attempts are rate-limited per IP.
const TOKEN = process.env.E2E_ADMIN_TOKEN ?? process.env.ADMIN_TOKEN;

test.describe("admin CMS", () => {
  test.describe.configure({ mode: "serial" });
  test.skip(({ isMobile }) => isMobile, "desktop only");
  test.skip(!TOKEN, "set E2E_ADMIN_TOKEN to run the admin tests");

  async function signIn(page: Page, token: string) {
    await page.goto("/admin/login");
    await page.getByLabel("Admin token").fill(token);
    await page.getByRole("button", { name: "Sign In" }).click();
  }

  test("rejects a wrong token", async ({ page }) => {
    await signIn(page, "definitely-wrong");
    await expect(page.getByText("Invalid token")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("adds a skill, shows it publicly, then deletes it", async ({ page }) => {
    const name = `E2E Skill ${Date.now()}`;
    await signIn(page, TOKEN!);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    await page.goto("/admin/skills");
    await page.getByRole("button", { name: "+ Add Skill" }).click();
    const dialog = page.getByRole("dialog", { name: "Add Skill" });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Name").fill(name);
    await dialog.getByLabel("Category").selectOption("Data");
    await dialog.getByRole("button", { name: "Save" }).click();
    await expect(dialog).toHaveCount(0);
    const row = page.getByRole("row").filter({ hasText: name });
    await expect(row).toBeVisible();

    // the public page renders from the API on every request
    await page.goto("/");
    await expect(page.locator("#skills")).toContainText(name);

    await page.goto("/admin/skills");
    page.once("dialog", (d) => d.accept());
    await page.getByRole("row").filter({ hasText: name }).getByRole("button", { name: "Delete" }).click();
    await expect(page.getByRole("row").filter({ hasText: name })).toHaveCount(0);
  });

  test("Escape closes the editor and focus lands on its close button first", async ({ page }) => {
    await signIn(page, TOKEN!);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await page.goto("/admin/projects");
    await page.getByRole("button", { name: "+ Add Project" }).click();
    const dialog = page.getByRole("dialog", { name: "Add Project" });
    await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
    // typing must not pull focus back to the close button
    await dialog.getByLabel("Title").fill("draft");
    await expect(dialog.getByLabel("Title")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });

  test("an expired token sends you back to sign in", async ({ page }) => {
    await page.goto("/admin/login");
    await page.evaluate(() => sessionStorage.setItem("admin_token", "rotated-token"));
    await page.goto("/admin/skills");
    await expect(page.getByRole("row").nth(1)).toBeVisible(); // reads are public
    page.once("dialog", (d) => d.accept());
    await page.getByRole("row").nth(1).getByRole("button", { name: "Delete" }).click();
    await page.waitForURL(/\/admin\/login$/);
    await expect(page.getByLabel("Admin token")).toBeVisible();
  });
});
