FROM node:20-alpine

WORKDIR /app

COPY ../../package.json ../../pnpm-workspace.yaml ./
COPY ../../packages ./packages
COPY ./package.json ./apps/api/package.json

RUN corepack enable && pnpm install

COPY ./ ./apps/api
WORKDIR /app/apps/api

RUN pnpm prisma:generate && pnpm build

EXPOSE 4000

CMD ["pnpm", "start"]
