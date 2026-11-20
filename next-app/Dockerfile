FROM node:22-alpine AS deps
WORKDIR /app
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build?schema=public"
COPY next-app/package.json ./package.json
RUN npm install --no-audit --no-fund

FROM node:22-alpine AS builder
WORKDIR /app
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build?schema=public"
COPY --from=deps /app/node_modules ./node_modules
COPY next-app/ ./
RUN npx prisma generate && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
