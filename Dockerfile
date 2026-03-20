# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.13.0
FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

# Install native dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev

# Install node dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy project
COPY . .

# 🔑 FIX PERMISSIONS
RUN chown -R node:node /usr/src/app

# Switch to node user
USER node

EXPOSE 3000

CMD ["npm","run","dev"]