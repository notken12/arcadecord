FROM bitnami/node:16.15.0

ENV NODE_ENV=production
WORKDIR /app/
# Copy and download dependencies
COPY package.json ./
COPY package-lock.json ./
RUN apt update && apt install python gcc make -y
RUN npm ci --production

FROM node:16.15.0-buster-slim
ENV NODE_ENV=production
# Copy the source files into the image
WORKDIR /app/
COPY . .
COPY --from=0 /app ./

ENV PORT=3000
EXPOSE 3000
CMD node bot/index.js
