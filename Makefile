DOCKER_COMPOSE_BASE=docker-compose.yml
DOCKER_COMPOSE_DEV=docker-compose.dev.yml
DOCKER_COMPOSE_PROD=docker-compose.prod.yml

dev:
	docker compose -f $(DOCKER_COMPOSE_BASE) -f $(DOCKER_COMPOSE_DEV) up --build
	
prod:
	docker compose -f $(DOCKER_COMPOSE_BASE) -f $(DOCKER_COMPOSE_PROD) up --build


down:
	docker compose -f $(DOCKER_COMPOSE_BASE) down

fclean: down
	docker rmi $$(docker images -q) 2>/dev/null || true
	docker volume rm $$(docker volume ls -q) 2>/dev/null || true
	docker network rm $$(docker network ls -q) 2>/dev/null || true

super_clean: fclean
	sudo rm /root/projects/ft_transcendence/services/chat-service/src/database/chat.db
	sudo rm /root/projects/ft_transcendence/services/user-service/database/user-service.db
	sudo rm /root/projects/ft_transcendence/services/game-service/src/database/game.db
	sudo rm logs/*.log

re: down dev