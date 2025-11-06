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

```
POST /api/admin/
POST /api/admin/task
DELETE /api/admin/task
GET /api/admin/users
GET /api/admin/logs  


POST /api/challenge/verify_flag
POST /api/challenge/category_tasks
POST /api/challenge/categories
POST /api/challenge/task/:id


POST /api/user/login
POST /api/user/register
PATCH /api/user/change_password
```

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
