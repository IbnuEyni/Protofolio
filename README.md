# Amir Ahmedin — AI Engineer Portfolio

Personal portfolio for an AI engineer working on multi-agent systems, evaluation benchmarks and automation pipelines. It includes **Ask-My-CV**, a bilingual (English / Amharic) chat assistant that answers questions about my experience using retrieval over my CV.

## Highlights

- **Ask-My-CV terminal.** Keyword-weighted retrieval over CV chunks, DeepSeek for generation, source labels on every answer, multi-turn history, and automatic Amharic detection. The prompt is grounded in the CV and tells the model to refuse rather than make things up.
- **Measured results.** A dashboard of shipped numbers: 35.2% pass@1 on DataAgentBench, 45 s / $0.02 per automated code audit, and a 250-task benchmark published on HuggingFace.
- **Skills network.** A force-directed graph showing how languages connect to frameworks and AI tooling.
- **Admin CMS** at `/admin`. Token-protected CRUD for projects, experience, skills and certifications, so content changes don't need a redeploy.

## Architecture

```
Browser ──► Next.js 16 (Cloud Run) ──/api/* rewrite──► Flask API (Cloud Run) ──► Cloud SQL Postgres
                 │  server components fetch                  │
                 └──── directly via BACKEND_URL ─────────────┘──► DeepSeek API (chat)
```

| Layer    | Stack |
|----------|-------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind, Framer Motion, react-force-graph |
| Backend  | Flask 3, SQLAlchemy, Gunicorn |
| Data     | PostgreSQL 16 |
| AI       | Custom keyword retrieval + DeepSeek chat completions |
| Infra    | Docker (multi-stage, non-root), Cloud Run, Artifact Registry, Secret Manager, GitHub Actions with Workload Identity Federation |

### Security

- Admin routes require a bearer token, compared in constant time.
- `/api/chat` is rate-limited per IP (10/min) and has a global hourly ceiling to cap LLM spend. `/api/admin/login` allows 5 attempts per 15 min.
- CORS is off by default. The browser only reaches the API through the same-origin Next.js proxy.
- CI runs `tsc`, `npm audit`, Bandit, `pip-audit` and Hadolint before every deploy.

## Running locally

```bash
cp .env.example .env               # set DEEPSEEK_API_KEY and ADMIN_TOKEN
docker compose up --build
docker compose exec backend python seed.py   # create tables + load CV data
```

- Site: http://localhost:3000
- API: http://localhost:5000/api/health
- Admin: http://localhost:3000/admin (log in with `ADMIN_TOKEN`)

### Tests

```bash
# backend unit tests (no database needed)
cd backend && python -m pytest -q tests

# end-to-end tests against the running stack (uses your installed Google Chrome)
docker compose up -d --build --wait && docker compose exec backend python seed.py
cd frontend && npx playwright test
```

The end-to-end suite runs in desktop and phone viewports. It covers rendering, the detail dialogs (keyboard and focus handling), the chat assistant with a stubbed API, reduced motion, SEO files, security headers, and a regression check for animations fighting CSS transitions. CI runs both suites before every deploy.

### Environment variables

| Variable | Service | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | backend | Postgres connection string |
| `DEEPSEEK_API_KEY` | backend | LLM for the chat assistant |
| `ADMIN_TOKEN` | backend | Bearer token for admin endpoints |
| `CORS_ORIGINS` | backend | Optional comma-separated allowed origins |
| `BACKEND_URL` | frontend | Server-side URL of the Flask API |
| `SITE_URL` | frontend | Public URL, used for absolute Open Graph image links |

## Deployment

Pushing to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): lint and audit jobs, then build and push both images to Artifact Registry and deploy them to Cloud Run. Secrets come from Secret Manager. For first-time GCP setup, run [`infra/bootstrap.sh`](infra/bootstrap.sh).

To use a custom domain for link previews, set a `SITE_URL` repository variable.

## Contact

[GitHub](https://github.com/IbnuEyni) · [LinkedIn](https://www.linkedin.com/in/amir-ahmedin-812349264/) · [HuggingFace](https://huggingface.co/shuaibam) · shuaibamir69@gmail.com
