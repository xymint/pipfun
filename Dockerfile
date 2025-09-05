# Multi-stage Dockerfile for Next.js (pipfun)

FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate

# Dependencies layer
FROM base AS deps
COPY pnpm-lock.yaml package.json ./
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && rm -rf /var/lib/apt/lists/* \
 && update-ca-certificates \
 && --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --no-frozen-lockfile --prefer-offline --reporter=append-only

# Builder layer
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Runner layer
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate

# Copy build artifacts and runtime deps
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 8080
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "8080"]
