FROM node:19-alpine

WORKDIR /app

# COPY package*.json .
COPY . .

RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]