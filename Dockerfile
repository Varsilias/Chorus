# --- Base

FROM node:20-alpine as base

ENV NODE_ENV development
ENV ENV development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY  . .


# --- Lint and Unit Test

FROM base as linter

ENV NODE_ENV test
ENV ENV test

WORKDIR /usr/src/app

RUN npm run lint && \
    npm run test

# --- Build

FROM linter as builder

WORKDIR /usr/src/app

RUN npm run build


# --- Production

FROM node:18-alpine

ENV NODE_ENV production
ENV ENV production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules/ ./node_modules/
COPY --from=builder /usr/src/app/dist/ ./dist/
COPY --from=builder /usr/src/app/.env.production ./

RUN npm prune --production

EXPOSE 3000

CMD ["npm", "run", "start:prod"]