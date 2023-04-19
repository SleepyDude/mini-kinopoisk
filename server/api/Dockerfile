FROM node:19-alpine

WORKDIR /app
COPY shared shared

WORKDIR /app/server/api
COPY ./server/api/package*.json .

RUN npm install

COPY ./server/api .

CMD ["npm", "run", "start:dev"]