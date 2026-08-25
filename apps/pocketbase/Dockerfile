FROM alpine:3.22

ARG PB_VERSION=0.39.8

RUN apk add --no-cache ca-certificates curl unzip \
    && curl -fsSL -o /tmp/pocketbase.zip "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" \
    && unzip /tmp/pocketbase.zip -d /usr/local/bin \
    && chmod +x /usr/local/bin/pocketbase \
    && rm -f /tmp/pocketbase.zip

WORKDIR /app

COPY pb_migrations ./pb_migrations
COPY pb_hooks ./pb_hooks

RUN mkdir -p /data

ENV PB_ENCRYPTION_KEY=""

EXPOSE 8090

VOLUME ["/data"]

CMD ["pocketbase", "serve", "--http=0.0.0.0:8090", "--encryptionEnv=PB_ENCRYPTION_KEY", "--dir=/data", "--migrationsDir=/app/pb_migrations", "--hooksDir=/app/pb_hooks", "--hooksWatch=false"]
