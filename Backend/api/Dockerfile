FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

#CMD ["npm", "run", "dev"]
CMD ["npm", "run", "watch"]
