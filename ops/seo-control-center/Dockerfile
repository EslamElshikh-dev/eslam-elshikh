FROM node:24-alpine

WORKDIR /app

COPY scripts/seo-control-center.mjs ./scripts/seo-control-center.mjs
COPY scripts/seo-control-center-server.mjs ./scripts/seo-control-center-server.mjs

ENV NODE_ENV=production
ENV PORT=8080

USER node

CMD ["node", "scripts/seo-control-center-server.mjs"]
