DOCKER_COMPOSE_NAME=docker-compose.yml

all: up

up:
	docker compose -f $(DOCKER_COMPOSE_NAME) up --build

down:
	docker compose -f $(DOCKER_COMPOSE_NAME) down