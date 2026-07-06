# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_BASE_URL=/api
ARG NEXT_PUBLIC_ENABLE_REALTIME=true
ARG NEXT_PUBLIC_SIGNALR_TRANSPORT=websockets
ARG NEXT_PUBLIC_REALTIME_DEBUG=false

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_ENABLE_REALTIME=$NEXT_PUBLIC_ENABLE_REALTIME
ENV NEXT_PUBLIC_SIGNALR_TRANSPORT=$NEXT_PUBLIC_SIGNALR_TRANSPORT
ENV NEXT_PUBLIC_REALTIME_DEBUG=$NEXT_PUBLIC_REALTIME_DEBUG

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
