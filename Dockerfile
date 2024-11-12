# --- Base

FROM node:20-alpine as base

ENV NODE_ENV development
ENV ENV development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY  . .


# --- Build

FROM base as builder

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