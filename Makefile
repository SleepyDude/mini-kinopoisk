run:
	docker compose --profile dev up

build:
	docker compose --profile dev build

run-social-test:
	docker-compose --profile test up postgres_test rabbitmq auth social

run-all-test:
	docker-compose --profile test up postgres_test rabbitmq auth social persons movies
