# Docker cheatsheet

## Motivation

- Overview

  - Selling points

    - _Dopasowują się_: Nawet skomplikowane aplikacje mogą zostać skonteneryzowane.
    - _Lekkie_: Współdzielą kernel.
    - _Wymienne_: Wydawanie aktualizacji w locie.
    - _Przenoszalne_: Buduj lokalnie, wysyłaj do chmury, uruchom wszędzie.
    - _Skalowalne_: Replikacja.

  - Docker flow

    - Developerzy tworzą kod i udostępniają go w kontenerach
    - Używają dockera żeby wrzucić kontenery do środowiska testowego i uruchamiają testy automatyczne
    - Gdy testowanie kończy się pozytywnie, fix dla klienta to zwykłe wypchanie zaktualizowanego obrazu na produkcję

- Containers and virtual machines

  - Oddzielenie aplikacji od infrastruktury
  - kontenery są _lekkie_ bo nie potrzebują _hypervisora_
  - pozwala na uruchomienie aplikacji w _odizolowanym środowisku_ zwanym kontenerem
  - _izolacja_ i _bezpieczeństwo_ pozwala na uruchamianie wielu kontenerów na jednym hoście
  - szybki deploy

- Docker Engine

  - server
    - demon (`dockerd`)
    - tworzy, zarządza obrazami, kontenerami, sieciami i volumes (kłębami?)
  - REST API - gada z demonem
  - CLI - client - gada z demonem poprzez REST API (`docker`)

- Images and Containers

  - **Image** zawiera wszystko co potrzebne do uruchomienia kontenera
    - kod
    - środowisko uruchomieniowe
    - biblioteki
    - zmienne środowiskowe
    - pliki konfiguracyjne
  - **Container** jest konkretną instancją danego obrazu

    - jest tym czym staje się **Image** gdy go wykonamy
    - zawiera stan
    - create, start, stop. move, delete
    - jest odizolowany, można to kontrolować jak bardzo

  - Docker registry
    - stores docker images
    - Docker Hub - public registry anyone can use
    - you can run private registry

## Get started with Docker

### Part 1: Orientation

#### [Installation](https://docs.docker.com/engine/installation/)

#### Test Docker version

- run `docker --version`
- run `docker info`
- run `docker run hello-world`

```shell
## List Docker CLI commands
docker
docker container --help

## Display Docker version and info
docker --version
docker version
docker info

## Execute Docker image
docker run hello-world

## List Docker images
docker image ls

## List Docker containers (running, all, all in quiet mode)
docker container ls
docker container ls --all
docker container ls -aq
```

### Part 2: Containers

#### Define a container with `Dockerfile`
- definiuje co się dzieje w srodowisku wewnatrz kontenera
- dostep do zasobow (sieć, dysk)
- mapowanie portów
- kopiowanie plików do kontenera

```docker
# Use an official Node runtime as a parent image
FROM node:10.12.0-alpine

# Set working directory to /src
WORKDIR /app

# Copy from our machine to container
# COPY [local path] [container path]
COPY . .

# Install node_modules
RUN npm ci

# Expose container port to outside world
EXPOSE 3000

# Run app.js when container launches
CMD ["npm", "start"]
```

#### Build the app
```shell
docker build --tag=nodemongo .
```
- `docker image ls`

#### Run the app
```shell
docker run -p 4000:3000 nodemongo
```
```
docker container ls
```
```
docker container stop <hash>
```

#### Sharing is caring
[Docker Hub](https://hub.docker.com/)
```
docker login
```
```
docker tag image username/repository:tag
```
```
docker push username/repository:tag
```
```
docker run -p 4000:80 username/repository:tag
```

## Services, Swarm and Docker Compose

### Services and Swarm
```
docker swarm init
```
```
docker stack deploy -c docker-compose.yml getstartedlab
```

### Docker compose

#### Three-step process
- Definiujemy `Dockerfile` by móc  wszędzie zreprodukować aplikację
- Definiujemy usługi w `docker-compose.yml` by mogły współdziałać razem w odizolowanym środowisku
- Uruchamiamy `docker-compose up`, który startuje całą aplikację

#### [Example](https://github.com/madhums/node-express-mongoose-demo)

```yml
version: "3.2"

services:
  node:
    build:
      context: .
      dockerfile: ./docker/node/Dockerfile
    volumes:
      - .:/app
      - /app/node_modules
    command: npm start
    env_file:
      - .env
    ports:
      - 3000:3000
    depends_on:
      - mongo
  express:
    image: mongo-express
    ports:
      - 8081:8081
    depends_on:
      - mongo
  mongo:
    image: mongo
    restart: always
    volumes:
      - ./data:/data/db
```

#### Deploy
  - `docker stack deploy -c docker-compose.yml mongo`

  or
  - `docker-compose -f docker-compose.yml up`

#### Different environments
- **docker-compose.yml**
  ```yml
  web:
    image: example/my_web_app:latest
    links:
      - db
      - cache

  db:
    image: postgres:latest

  cache:
    image: redis:latest
  ```

- **docker-compose.override.yml**
  ```yml
  web:
    build: .
    volumes:
      - '.:/code'
    ports:
      - 8883:80
    environment:
      DEBUG: 'true'

  db:
    command: '-d'
    ports:
      - 5432:5432

  cache:
    ports:
      - 6379:6379
  ```
- **docker-compose.prod.yml**
  ```yml
  web:
  ports:
    - 80:80
  environment:
    PRODUCTION: 'true'

  cache:
    environment:
      TTL: '500'
  ```

- deploy to production `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d`