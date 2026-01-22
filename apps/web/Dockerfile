FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/web/package.json ./apps/web/package.json

RUN corepack enable && pnpm install

COPY apps/web ./apps/web
WORKDIR /app/apps/web

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
