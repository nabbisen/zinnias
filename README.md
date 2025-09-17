# Zinnias 🌼

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
