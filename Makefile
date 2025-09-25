DOCKER_COMPOSE_BASE=docker-compose.yml
DOCKER_COMPOSE_DEV=docker-compose.dev.yml
DOCKER_COMPOSE_PROD=docker-compose.prod.yml

dev:
	docker compose -f $(DOCKER_COMPOSE_BASE) -f $(DOCKER_COMPOSE_DEV) up -d --build
	
prod:
	docker compose -f $(DOCKER_COMPOSE_BASE) -f $(DOCKER_COMPOSE_PROD) up --build


down:
	docker compose -f $(DOCKER_COMPOSE_BASE) down

fclean: down
	docker rmi $$(docker images -q) 2>/dev/null || true
	docker volume rm $$(docker volume ls -q) 2>/dev/null || true
	docker network rm $$(docker network ls -q) 2>/dev/null || true

re: down dev