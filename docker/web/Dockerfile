FROM bitnami/node:16.15.0

ENV NODE_ENV=production
WORKDIR /app/
# Copy and download dependencies
COPY www/package.json ./
COPY www/package-lock.json ./
RUN npm ci --production

FROM node:16.15.0-alpine3.15
ENV NODE_ENV=production
# Copy the source files into the image
WORKDIR /app/
COPY www .
COPY --from=0 /app ./
COPY www/.env .

RUN npm run build
RUN rm -rf node_modules

ENV PORT=3000
EXPOSE 3000
CMD node .output/server/index.mjs
