FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/worker/package.json ./apps/worker/package.json

RUN corepack enable && pnpm install

COPY apps/worker ./apps/worker
WORKDIR /app/apps/worker

RUN pnpm build

CMD ["pnpm", "start"]
