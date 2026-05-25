# syntax=docker/dockerfile:1.7
# Multi-stage build for the FeastBox Express API.

FROM node:22-alpine AS deps
WORKDIR /app
COPY server/package.json server/package-lock.json ./
# --ignore-scripts blocks the @prisma/client postinstall; schema isn't
# copied yet, so we run prisma generate manually below with the schema present.
RUN npm ci --omit=dev --ignore-scripts
COPY server/prisma ./prisma
RUN npx prisma generate

FROM node:22-alpine AS production
WORKDIR /app
# tini handles PID-1 signal forwarding; without it SIGTERM from docker stop /
# K8s pod deletion is silently dropped and pods take the full grace period.
RUN apk add --no-cache tini
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node server/ ./
USER node
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --spider http://localhost:3000/health || exit 1
# CMD is `node` (not `npm start`) because npm intercepts SIGTERM and breaks
# tini's clean shutdown.
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
