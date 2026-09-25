# Coolify — Worldwide Invest

- **App name:** `worldwide-invest`
- **App UUID:** `dtyakrkjo0kmcfibicklmu8g`
- **Project UUID:** `htnlkt7nr7nq6t0gl8d2ofag` (Worldwide Invest)
- **Server:** `office-app` (`ioanw4booex0bmxzybzvrckg` / `10.0.10.154`) — same place as zeido-site
- **Destination:** `oc9fxaltpfhjo5vwgmxy86d7`
- **Git:** `https://github.com/majjed2008/worldwide-invest` branch `main` (public)
- **Build:** Dockerfile → nginx:alpine on port `80`
- **Domains:** `https://worldwide-invest.org` (canonical). `www` → apex via Coolify `redirect=non-www`
- **Edge:** mj-server Traefik `/data/coolify/proxy/dynamic/office-app.yaml` hosts → office-app `:443`
- **Mail:** SpaceMail DNS untouched

## Deploy

```powershell
git push origin main
# Coolify auto-deploy if enabled, or:
# POST /api/v1/deploy { uuid: dtyakrkjo0kmcfibicklmu8g, force: true }
```

## Health

- Public: `https://worldwide-invest.org/` → 200, body contains `Worldwide Invest`
- `https://www.worldwide-invest.org/` → 301/308 to `https://worldwide-invest.org/`
- Do not change SpaceMail MX/SPF/DKIM when editing Cloudflare
