# Docker cheatsheet

## Motivation

- Overview

  - Selling points

    - **Dopasowują się**: Nawet skomplikowane aplikacje mogą zostać skonteneryzowane.
    - **Lekkie**: Współdzielą kernel.
    - **Wymienne**: Wydawanie aktualizacji w locie.
    - **Przenoszalne**: Buduj lokalnie, wysyłaj do chmury, uruchom wszędzie.
    - **Skalowalne**: Replikacja, load balance

  - Docker flow

    - Developerzy tworzą kod i udostępniają go w kontenerach
    - Używają dockera żeby wrzucić kontenery do środowiska testowego i uruchamiają testy automatyczne
    - Gdy testowanie kończy się pozytywnie, fix dla klienta to zwykłe wypchanie zaktualizowanego obrazu na produkcję

- Containers and virtual machines

  - Oddzielenie aplikacji od infrastruktury
  - kontenery są **lekkie** bo nie potrzebują **hypervisora**, mają dostęp bezpośrednio do **kernela**
  - pozwala na uruchomienie aplikacji w **odizolowanym środowisku** zwanym kontenerem
  - **izolacja** i **bezpieczeństwo** pozwala na uruchamianie wielu kontenerów na jednym hoście
  - szybki deploy

- Docker Engine

  - server
    - demon (`dockerd`)
    - tworzy, zarządza obrazami, kontenerami, sieciami i volumes (kłębami?)
  - REST API - gada z demonem
    - **docker.rest.get.images.sh**
      ```sh
      #!/bin/sh
      curl --unix-socket /var/run/docker.sock localhost/images/json
      ```
  - CLI - client - gada z demonem poprzez REST API (`docker`)

- Images and Containers

  - **Image** zawiera wszystko co potrzebne do uruchomienia kontenera. _Jest przepisem na stworzenie kontenera._
    - kod
    - środowisko uruchomieniowe
    - biblioteki
    - zmienne środowiskowe
    - pliki konfiguracyjne
    - składa się z **warstw**
  - **Container** jest konkretną instancją danego obrazu

    - jest tym czym staje się **Image** gdy go wykonamy
    - zawiera stan
    - create, start, stop. move, delete
    - jest odizolowany, można to kontrolować jak bardzo, np. które porty są dostępne na zewnątrz

  - Docker registry
    - zawiera obrazy dockera
    - **Docker Hub** - publiczne repozytorium, które każdy może używać
    - można założyć własne prywatne repozytorium

- Volumes (kłęby)
  - Volumes can be more safely shared among multiple containers.
  - In addition, volumes are often a better choice than persisting data in a container’s writable layer, because a volume does not increase the size of the containers using it, and the volume’s contents exist outside the lifecycle of a given container.

## Get started with Docker

### Part 1: Orientation

#### [Installation](https://docs.docker.com/engine/installation/)

#### Test Docker version

- run `docker --version`
- run `docker info`
- run `docker run hello-world`

```sh
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

```dockerfile
# Use an official Node runtime as a parent image
FROM node:10.12.0-alpine

# Set working directory to /src
WORKDIR /app

# Install node_modules
COPY package*.json ./
RUN npm install

# Copy from our machine to container
# COPY [local path] [container path]
COPY . .

# Expose container port to outside world
EXPOSE 3000

# Run app.js when container launches
CMD ["npm", "start"]
```

#### Build the app

```
docker build --tag=example_client .
```

```
docker image ls
```

#### Run the app

```
docker run -p 3000:3000 example_client
```

```
docker container ls
```

```
docker container stop <hash>
```

#### Sharing is caring

[Docker Hub](https://hub.docker.com/)
Login to docker hub

```
docker login
```

```
docker tag image username/repository:tag
```

```
docker image ls
```

```
docker push username/repository:tag
```

```
docker run -p 4000:80 username/repository:tag
```

#### Recap

```sh
docker build -t friendlyhello .  # Create image using this directory's Dockerfile
docker run -p 4000:80 friendlyhello  # Run "friendlyhello" mapping port 4000 to 80
docker run -d -p 4000:80 friendlyhello         # Same thing, but in detached mode
docker container ls                                # List all running containers
docker container ls -a             # List all containers, even those not running
docker container stop <hash>           # Gracefully stop the specified container
docker container kill <hash>         # Force shutdown of the specified container
docker container rm <hash>        # Remove specified container from this machine
docker container rm $(docker container ls -a -q)         # Remove all containers
docker image ls -a                             # List all images on this machine
docker image rm <image id>            # Remove specified image from this machine
docker image rm $(docker image ls -a -q)   # Remove all images from this machine
docker login             # Log in this CLI session using your Docker credentials
docker tag <image> username/repository:tag  # Tag <image> for upload to registry
docker push username/repository:tag            # Upload tagged image to registry
docker run username/repository:tag                   # Run image from a registry
```

## Services, Swarm and Docker Compose

### Services and Swarm

```
docker swarm init
```

```
docker stack deploy -c docker-compose.yml example
```

```
docker service ls
```

### Docker compose

#### Three-step process

- Definiujemy `Dockerfile` by móc wszędzie zreprodukować aplikację
- Definiujemy usługi w `docker-compose.yml` by mogły współdziałać razem w odizolowanym środowisku
- Uruchamiamy `docker-compose up`, który startuje całą aplikację

#### [Example](https://github.com/madhums/node-express-mongoose-demo)

```yml
version: "3"

services:
  client:
    image: adrianmuchavazco/example_client
    build: ./client
    volumes:
      - ./client:/usr/src/app
      - /usr/src/app/node_modules
      - /usr/src/app/build
    command: npm start
    env_file:
      - .env
    ports:
      - 3000:3000
    depends_on:
      - server
    deploy:
      replicas: 3
    networks:
      - webnet

  server:
    image: adrianmuchavazco/example_server
    build: ./server
    volumes:
      - ./server:/usr/src/app
      - /usr/src/app/node_modules
    command: npm start
    env_file:
      - .env
    ports:
      - 4000:3000
    depends_on:
      - mongo
    deploy:
      replicas: 5
      resources:
        limits:
          cpus: "0.1"
          memory: 50M
      restart_policy:
        condition: on-failure
    networks:
      - webnet

  express:
    image: mongo-express
    ports:
      - 8081:8081
    depends_on:
      - mongo
    networks:
      - webnet

  mongo:
    image: mongo
    restart: always
    volumes:
      - ./data:/data/db
    networks:
      - webnet

  visualizer:
    image: dockersamples/visualizer:stable
    ports:
      - "8080:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock"
    deploy:
      placement:
        constraints: [node.role == manager]
    networks:
      - webnet

networks:
  webnet:
```

#### Deploy

- `docker stack deploy -c docker-compose.yml example`

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
      - ".:/code"
    ports:
      - 8883:80
    environment:
      DEBUG: "true"

  db:
    command: "-d"
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
    PRODUCTION: "true"

  cache:
    environment:
      TTL: "500"
  ```

- deploy to production `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d`
