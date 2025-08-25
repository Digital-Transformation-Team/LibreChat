# Contributing to LibreChat (fork by [bl1nkker](https://github.com/bl1nkker/LibreChat))

This guide will help you set up your local environment and start making changes.

---

## 1. Fork and Clone the Repository

Clone the forked repository to your local machine:

```bash
git clone https://github.com/bl1nkker/LibreChat.git
cd LibreChat
```

## 2. Set Up MongoDB

LibreChat requires MongoDB.
It is recommended to run it with Docker:

```yaml
services:
  mongodb:
    container_name: chat-mongodb
    image: mongo
    restart: always
    user: '${UID}:${GID}'
    ports:
      - '27017:27017'
    volumes:
      - ./data-node:/data/db
    command: mongod --noauth
```

Run with:

```bash
docker compose up -d
```

(alternatively, you can install MongoDB as a local service)

## 3. Configuration

You need to create two configuration files in the project root:

- `librechat.yaml` – main configuration [documentation](https://www.librechat.ai/docs/configuration/librechat_yaml)
- `.env` – environment variables [documentation](https://www.librechat.ai/docs/configuration/dotenv)

## 4. Build and Start

Follow the official instructions: [Build and Start](https://www.librechat.ai/docs/local/npm)

## 5. Project Structure

Frontend: `/client`

Backend: `/api`

## 6. Making Changes

Always create a separate branch for your work.

Make sure the project builds and runs after your changes.

Run linters and tests before committing.

## 7. Pull Requests

Fork the repository.

Create a new branch from `main`.

Commit your changes.

Open a Pull Request to this fork.
