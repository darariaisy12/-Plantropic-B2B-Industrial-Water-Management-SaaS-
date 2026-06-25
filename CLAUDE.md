# Plantropic — B2B Industrial Water Management SaaS

Next.js 15 + React 19 + Tailwind app. Dev server runs on port **4028** (`next dev -p 4028`).

## PM2 Services

| Port | Name | Type |
|------|------|------|
| 4028 | plantropic-4028 | Next.js |

**Terminal Commands:**
```bash
pm2 start ecosystem.config.cjs   # First time
pm2 start all                    # After first time
pm2 stop all / pm2 restart all
pm2 start plantropic-4028 / pm2 stop plantropic-4028
pm2 logs / pm2 status / pm2 monit
pm2 save                         # Save process list
pm2 resurrect                    # Restore saved list
```
