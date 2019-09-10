# Docker cheatsheet

## Part 1: Motivation

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

- Docker registry
  - stores docker images
  - Docker Hub - public registry anyone can use
  - you can run private registry
  

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
