run:
	docker compose --profile dev up

build:
	docker compose --profile dev build

run-test:
	docker compose --profile test up

build-test:
	docker compose --profile test build