# Oxígeno — AI chat backend

A tiny Cloudflare Worker that powers the website chat assistant ("Oxi").
It runs the conversation through **Claude** and, when a visitor is ready,
emails the lead to the right inbox:

- Clients / prospects → **oxigeno@oxigenoweb.com**
- Job candidates → **seleccion@oxigenoweb.com**

## What you need

1. **Anthropic API key** — https://console.anthropic.com (Billing → API keys)
2. **SendGrid API key** — to send the lead emails (Oxígeno already uses SendGrid)
3. A **Cloudflare account** (free) + `npm i -g wrangler`

## Deploy (5 steps)

```bash
cd backend
wrangler login
wrangler secret put ANTHROPIC_API_KEY     # paste the key when prompted
wrangler secret put SENDGRID_API_KEY       # paste the key when prompted
wrangler deploy
```

`wrangler deploy` prints a URL like
`https://oxigeno-chat.<your-subdomain>.workers.dev`.

## Flip the site to live

In `../script.js`, set:

```js
const OXI_ENDPOINT = 'https://oxigeno-chat.<your-subdomain>.workers.dev';
```

Commit + push. Done — the widget now uses real Claude. Until then it runs
in a built-in guided "demo" mode so the bubble still works on the live site.

## Notes

- `FROM_EMAIL` must be a **verified sender / authenticated domain** in SendGrid,
  otherwise SendGrid rejects the message. Use an `@oxigenoweb.com` address.
- Model defaults to `claude-haiku-4-5-20251001` (fast + cheap). For richer
  conversation set `MODEL = "claude-sonnet-4-6"` in `wrangler.toml`.
- CORS is locked to `ALLOWED_ORIGIN`. If Oxígeno moves to its own domain
  (e.g. oxigenoweb.com), update that var and re-deploy.
