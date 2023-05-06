FROM node:19-alpine

WORKDIR /app

# Билдим шаред
COPY ./shared/src ./shared/src
COPY ./shared/package.json ./shared/.
COPY ./shared/tsconfig.json ./shared/.

WORKDIR /app/shared

RUN npm install
RUN npm run build

# Билдим сервис
WORKDIR /app/server/auth

COPY ./server/auth/package.json .

RUN npm install

CMD ["npm", "run", "start:dev"]