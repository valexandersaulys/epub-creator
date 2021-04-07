FROM node:alpine
RUN mkdir /code
COPY . /code
WORKDIR /code
EXPOSE $PORT
RUN npm install