# Nazwa kursu
Testowanie i Jakość Oprogramowania

# Autor
Black Ghost

# Temat projektu
System uruchamiania zadań

# Opis projektu
OlimpCTF to kompleksowa platforma CTF przeznaczona do hostowania wyzwań z zakresu cyberbezpieczeństwa. Projekt składa się z czterech głównych komponentów:

- **Frontend** - Interfejs użytkownika dla uczestników zawodów CTF
- **AdminPanel** - Panel administracyjny do zarządzania zadaniami, kategoriami i użytkownikami
- **Backend** - Serwer API do zarządzania użytkownikami, zadaniami, kategoriami i logami
- **TaskRunner** - Serwer do uruchamiania zadań w kontenerach Docker oraz weryfikacji flag

Platforma umożliwia dynamiczne tworzenie kategorii wyzwań, zarządzanie zadaniami, izolowane wykonywanie kodu w kontenerach Docker oraz system weryfikacji flag.

# Uruchomienie projektu

## Wymagania wstępne
- Node.js
- npm
- TypeScript (`sudo npm install -g ts-node`)
- Docker i Docker Compose

## Konfiguracja początkowa
1. Przejdź do `TaskRunner/api` i zmień nazwę `.env.example` na `.env`
2. Dodaj bezpieczny klucz do AES w pliku `.env`

## Uruchomienie

### Docker
```bash
docker-compose up --build
```

Aby zatrzymać:
```bash
docker-compose down
```

# Testy

Implementacja w 2 etapie.

# Dokumentacja API

Dokumentacja API jest dostępna poprzez **Swagger UI**.

## Backend API
Po uruchomieniu serwera Backend, dokumentacja Swagger dostępna jest pod adresem:
```
http://localhost:5000/swagpag
```

# Przypadki testowe dla testera manualnego
Implementacja w 2 etapie.

# Technologie użyte w projekcie

- **Docker & Docker Compose** - konteneryzacja aplikacji

## Frontend
- **Angular** - framework aplikacji
- **TypeScript** - język programowania
- **auth0** - obsługa JWT

## AdminPanel
- **Angular** - framework aplikacji
- **TypeScript** - język programowania
- **PrimeNG** - biblioteka komponentów UI
- **auth0** - obsługa JWT

## Backend
- **Express.js** - framework serwera
- **TypeScript** - język programowania
- **PostgreSQL** - baza danych
- **bcrypt** - hashowanie haseł
- **jsonwebtoken** - autentykacja JWT
- **Swagger** - dokumentacja API
- **Multer** - obsługa upload plików

## TaskRunner
- **Express.js** - framework serwera
- **TypeScript** - język programowania
- **Docker** - konteneryzacja i izolacja zadań
- **Node.js** - środowisko uruchomieniowe
- **PostgreSQL** - baza danych


---

.


.


.


.


.


.


.


.


.


.


.



.

.


.

.



.



.




---


# OlimpCTF

![Logo](Frontend/public/favicon.ico)

OlimpCTF is a Capture The Flag (CTF) platform designed for hosting cybersecurity challenges across various categories.


# Content

- [Start project](#start-project)
  - [Frontend](#frontend)
  - [AdminPanel](#adminpanel)
  - [Backend](#backend)
  - [Docker](#docker)
- [Categories](#categories)


# First start

1. Go to `TaskRunner/api` and rename `.env.example` to `.env`. Add secure key to AES.


# Start project

Install TS:

```bash
  sudo npm install -g ts-node
```

## Frontend

**Framework:** Angular

To run the frontend:
```bash
  cd Frontend
  ng serve
```

## AdminPanel

**Framework:** Angular

To run the admin panel:
```bash
  cd AdminPanel
  ng serve
```

## Backend

Server for managing users, tasks, categories, and logs.

**Framework:** Express.js

To run the backend API:
```bash
  cd Backend/api
  npm install
  npm run start
```

### API

Documentation on Swagger.

## TaskRunner

Server to run tasks in docker containers. And server for checking flags.

**Framework:** Express.js

To run the task-runner API:
```bash
  cd TaskRunner/api
  npm install
  npm run start
```

## Docker

To run the full stack using Docker:
```bash
  docker-compose up --build
```

To stop
```bash
  docker-compose down
```

## Categories

### Dynamic for database


```TABLE categories```


[//]: # (TODO: add statistic logic)
[//]: # (TODO: correct view)