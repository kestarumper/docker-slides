FROM node:10.12.0-alpine

WORKDIR /app
RUN ["pwd"]
COPY . .
RUN npm ci

EXPOSE 3000

CMD ["npm", "start"]
