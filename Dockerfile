# syntax=docker/dockerfile:1.7
#
# Multi-stage build for the FeastBox Express API. The Vue frontend is NOT
# packaged here — for the HD K8s demo it runs locally via `npm run dev`
# against the cluster's LoadBalancer. Bundling the SPA into the same image
# is post-HD work.
#
# Build context: repo root. `docker compose build api` (or `docker build .`
# from the repo root) wires everything up correctly. The `server/.env` file
# is gitignored AND dockerignored; runtime env arrives via compose / K8s
# Secret + ConfigMap.

# ─── Stage 1: deps + Prisma client generation ───────────────────────────────
#
# node:22-alpine matches server/package.json `engines >= 22`. FULLPLAN line
# 645 said node:20-alpine but the engines field was bumped after that doc
# was written (server/package.json:8); engines wins, see EXECUTION_LOG.
#
# Alpine: smaller surface (~50 MB base vs ~350 MB for slim/debian) and the
# project has no native deps that need glibc. If a future dependency needs
# glibc (sharp, canvas), swap to `node:22-slim`.
FROM node:22-alpine AS deps

WORKDIR /app

# Copy lockfile + manifest first so npm install layer caches when source
# changes but deps don't — the 80/20 of Docker build-time savings.
COPY server/package.json server/package-lock.json ./

# --omit=dev skips devDependencies (nodemon, vitest, supertest). The Prisma
# CLI lives in dependencies (moved there 2026-05-21 for Render deploy; the
# same fix is needed here because Render and Docker both install with
# NODE_ENV=production-equivalent semantics). --ignore-scripts blocks the
# @prisma/client postinstall here so we control when `prisma generate` runs
# (next step); without it the postinstall would run BEFORE we have the
# schema copied, producing an empty client.
RUN npm ci --omit=dev --ignore-scripts

# Copy ONLY the Prisma schema + migrations before running `prisma generate`.
# Generating the client requires schema.prisma but NOT the route handlers,
# so we keep the cache hit on this layer when only application code changes.
COPY server/prisma ./prisma

RUN npx prisma generate

# ─── Stage 2: production runtime ────────────────────────────────────────────
#
# Separate stage so the final image excludes anything we no longer need
# (e.g. the npm cache, build tools that Alpine might have pulled in for
# any native deps). Today we pull node_modules verbatim; the stage split
# also future-proofs the image for adding a build step (TypeScript compile,
# etc.) without growing the runtime layer.
FROM node:22-alpine AS production

WORKDIR /app

# tini is a tiny init system (~600 KB). PID 1 in a container has signal-
# handling responsibilities that Node.js does not implement well — without
# tini, SIGTERM from `docker stop` (and from K8s preStop / pod deletion)
# can be silently dropped, leading to the 10s grace timeout instead of a
# clean shutdown. wget is for the HEALTHCHECK below; Alpine's busybox wget
# is already on the image, no extra install needed.
RUN apk add --no-cache tini

# Run as the non-root `node` user (UID 1000, baked into the official node
# images). CLAUDE.md "What gets a PR rejected on sight" requires non-root
# containers; the senior bar is non-negotiable.
#
# `--chown=node:node` on the COPY sets ownership at copy time — cheaper
# than a chown after, which would double the layer size for large trees.
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
# server/ contains prisma/ already; no separate COPY needed for the schema.
COPY --chown=node:node server/ ./

USER node

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# HEALTHCHECK lets `docker compose up --wait` and Kubernetes liveness/
# readiness probes detect a hung process. /health returns immediately
# with `{ status: 'ok' }` and intentionally does NOT touch the DB, so a
# DB outage does not kill healthy API containers (the readiness probe
# in K8s pulls traffic, but the pod stays alive).
#
# --start-period covers boot time so the first 10s do not count against
# the failure threshold. --retries=3 with 30s interval = ~90s tolerance.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --spider http://localhost:3000/health || exit 1

# tini in `--` mode forwards every signal to the child. The CMD is `node`
# directly (NOT `npm start`) because npm intercepts SIGTERM and converts
# it to SIGINT with delays, which prevents the clean shutdown we just
# went out of our way to enable with tini.
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
