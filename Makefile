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

run-social-test:
	docker-compose --profile test up postgres_test rabbitmq auth social

run-all-test:
	docker-compose --profile test up postgres_test rabbitmq auth social persons movies
