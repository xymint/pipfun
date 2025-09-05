# Multi-stage Dockerfile for Next.js (pipfun)

FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_DISABLE_LIGHTNINGCSS=1
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate

# Dependencies layer (install devDependencies for build)
FROM base AS deps
ENV NODE_ENV=development
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --no-frozen-lockfile --prefer-offline --reporter=append-only

# Builder layer
FROM base AS builder
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Runner layer (standalone output)
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate

# Copy standalone server and static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 8080
CMD ["node", "server.js"]
