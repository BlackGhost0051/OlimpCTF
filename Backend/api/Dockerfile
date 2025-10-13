FROM node:18

WORKDIR /app

COPY package*.json ./

COPY . .

CMD npm install && npm run watch
#CMD ["npm", "install", "-g", "ts-node"] ???