FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

#CMD ["npm", "install", "-g", "ts-node"]
#CMD ["npm", "run", "dev"]
CMD ["npm", "run", "watch"]
