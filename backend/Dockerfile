# syntax=docker/dockerfile:1
# Contexte de build = ./backend. La version de Node est alignée sur .nvmrc
ARG NODE_VERSION=22

# Base avec OpenSSL : la CLI Prisma en a besoin pour générer le client
FROM node:${NODE_VERSION}-slim AS base
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# dépendances
FROM base AS deps
COPY package.json package-lock.json .npmrc ./
RUN npm ci

# build : génération du client Prisma + compilation Nest
FROM deps AS build
COPY . .
RUN npm run build

# dépendances de production uniquement
FROM node:${NODE_VERSION}-slim AS prod-deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev

# image finale
FROM node:${NODE_VERSION}-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

# dossier des mémoires PDF déposés -- a monter sur un volume
RUN mkdir -p /app/uploads && chown -R node:node /app
USER node

EXPOSE 3000

#fetch de Node 22
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/main.js"]