# Zinnias 🌼

## Start up

HTTPS is required for camera usage. Generate SSL key and cert with the command lines:

```sh
openssl genrsa -out key.pem 2048; openssl req -x509 -sha256 -days 365 -key key.pem -out cert.pem -subj "/CN=localhost"
```

## Dev

```sh
bun run dev
# bun run dev --open
```

### When `wrangler.toml` is modified

```sh
bunx wrangler types ./src/worker-configuration.d.ts
```

## Deploy

```sh
bun run build
bunx wrangler deploy
```

## Ref: Startup

```sh
bun create cloudflare@latest appname --framework=svelte

bun install -D wrangler@latest
bunx wrangler init . -y
```
