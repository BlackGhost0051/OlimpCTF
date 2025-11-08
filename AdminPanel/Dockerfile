FROM node:20

WORKDIR /app

COPY package*.json ./

RUN rm -rf node_modules/
RUN npm install

COPY . .

EXPOSE 4200

CMD npx ng serve --host 0.0.0.0
