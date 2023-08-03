# ft_transcendence
Ft_transcendance is a Docker-compose deployable webgame that features social-networking mechanisms such as friendships, direct-messages, and profile pictures. It includes a real-time multiplayer version of the classic game Pong and a chatroom with administration roles. The project also implements authentication using OAuth2 (through the 42school provider) and a 2FA-TOTP implementation. It is built on top of NestJS as the backend, PostgreSQL as the database, and ReactJS/Tailwind as the frontend.

## Project Structure
The project is composed of the following images:

- **nestjs**: The backend server built with NestJS.
- **prisma_studio**: A visual database management tool (Prisma Studio) connected to a PostgreSQL database.
- **react**: The frontend application built with ReactJS.

## Prerequisites
To run this project, you need to have the following dependencies installed:

- Docker
- Docker Compose

You also need to have access to API credentials from 42 School.

## Getting Started
To run the project, follow these steps:

1. Clone the repository:
```fish
git clone https://github.com/misteriaud/ft_transcendance.git
cd ft_transcendance
```

2. Create a .env file by copying the provided .env.example file:
```fish
cp .env.example .env
```

3. Update the environment variables in the .env file to match your configuration.
4. Build and run the containers using Docker Compose or the Makefile:
```fish
docker-compose up --build
```
or
```fish
make
```
This will start the NestJS backend, PostgreSQL database, and React frontend.

5. Once the containers are running, you can access the application by opening http://localhost:8080 in your web browser.

## Skills acquired:

- REST API concepts
- React and Typescript
- Websockets
- Multiplayer network gaming concepts (prediction, latency management, queue management...)
- Interface between NestJS Object-oriented data-structure and PostgreSQL relational database via Prisma.
- Authentication and authorization standards (OAuth2, JWT, Password hashing, TOTP).
