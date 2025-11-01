FROM node:20

WORKDIR /app

COPY package*.json ./

COPY . .

EXPOSE 4200

CMD npm install && npx ng serve --host 0.0.0.0
