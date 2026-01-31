FROM node:20-alpine

WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/simulator/package.json packages/simulator/package.json
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
RUN pnpm install --filter web...

COPY apps/web apps/web
COPY packages/simulator packages/simulator

WORKDIR /app/apps/web
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
