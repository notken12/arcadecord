FROM bitnami/node:16.15.0

ENV NODE_ENV=production
WORKDIR /app/
# Copy and download dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --production

FROM node:16.15.0-alpine3.15
ENV NODE_ENV=production
# Copy the source files into the image
WORKDIR /app/
COPY . .
COPY --from=0 /app ./

RUN npm run build

ENV PORT=3000
EXPOSE 3000
CMD node server/web.js
