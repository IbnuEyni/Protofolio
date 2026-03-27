# =============================================================================
# frontend/Dockerfile  —  Enterprise-grade 3-stage Next.js image
# =============================================================================

# ── Stage 1: dependency install ───────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts

# ── Stage 2: Next.js build ────────────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Copy config files first (change rarely) — maximises cache hits
COPY package.json next.config.mjs tsconfig.json tailwind.config.ts postcss.config.js ./
# Copy source last — only invalidates the build step, not npm ci
COPY src ./src
ARG NEXT_PUBLIC_API_URL=""
ARG BACKEND_URL=""
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV BACKEND_URL=$BACKEND_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN --mount=type=cache,target=/app/.next/cache npm run build

# ── Stage 3: production runner ────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache wget dumb-init

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 10001 appgroup \
    && adduser --system --uid 10001 --ingroup appgroup \
               --no-create-home --shell /sbin/nologin appuser

COPY --from=builder --chown=10001:10001 /app/.next/standalone ./
COPY --from=builder --chown=10001:10001 /app/.next/static     ./.next/static

# public/ is optional — create empty dir (project has no static assets folder)
RUN mkdir -p ./public

USER 10001
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -qO- http://localhost:3000/ || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
