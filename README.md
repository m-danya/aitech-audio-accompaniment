### AITech Audio Accompaniment

## Run locally

```bash
docker-compose up --build
```

And open [http://localhost:1337](http://localhost:1337)

## Deploying

Put `fullchain.crt` and `ssl.key` into `web-container/services/nginx`

```bash
docker-compose up --build -f docker-compose.yml docker-compose.prod.yml
```