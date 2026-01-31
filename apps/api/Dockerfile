FROM node:20-alpine

WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/simulator/package.json packages/simulator/package.json
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
RUN pnpm install --filter api...

COPY apps/api apps/api
COPY packages/simulator packages/simulator

WORKDIR /app/apps/api
RUN pnpm build

EXPOSE 4000
CMD ["pnpm", "start"]
