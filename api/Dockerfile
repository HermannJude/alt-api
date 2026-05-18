ARG NODE_VERSION=24-alpine

FROM node:${NODE_VERSION} AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV CI=true
ENV NODE_ENV=development

WORKDIR /app


RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

FROM base AS test
RUN pnpm install --frozen-lockfile
COPY . .
CMD ["pnpm", "test"]

FROM base AS development
RUN pnpm install --frozen-lockfile
COPY . .
CMD ["pnpm", "run", "start:dev"]