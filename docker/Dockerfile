FROM node:alpine
WORKDIR /app
COPY src /app
RUN npm install
ENTRYPOINT ["node", "/app/index.js"]
