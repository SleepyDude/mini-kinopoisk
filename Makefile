run:
	docker compose --profile dev up

build:
	docker compose --profile dev build

run-test:
	docker compose --profile test up

build-test:
	docker compose --profile test build

build-social:
	docker-compose --profile dev build --no-cache social

build-auth:
	docker-compose --profile dev build --no-cache auth

build-movies:
	docker-compose --profile dev build --no-cache movies

run-social:
	docker-compose --profile dev up postgres rabbitmq auth social

run-social-test:
	docker-compose --profile test up postgres rabbitmq auth social

run-api:
	docker-compose --profile dev up postgres rabbitmq auth social api

build-api:
	docker-compose --profile dev build --no-cache auth social api
