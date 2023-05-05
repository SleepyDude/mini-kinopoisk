FROM node:19-alpine

WORKDIR /app

COPY ./shared/src ./shared/src
COPY ./shared/package.json ./shared/.
COPY ./shared/tsconfig.json ./shared/.

WORKDIR /app/shared

RUN npm install
RUN npm run build

WORKDIR /app/server/api

COPY ./server/api/package.json .

RUN npm install

CMD ["npm", "run", "start:dev"]