FROM bitnami/node:16.15.0

ENV NODE_ENV=production
WORKDIR /app
# Copy and download dependencies
COPY ["package.json", "package-lock.json*", "./"]
RUN apt update && apt install python gcc make -y
RUN npm ci --production

# Copy the source files into the image
COPY . .

RUN npm run build

EXPOSE 3000
ENV PORT=3000
CMD node server/index.js
