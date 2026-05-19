# PBCL Team — Workforce Management System

A React-based HR & operations web app connected to Base44.

## Features

- 👥 **Employees** — Full employee records with CRUD
- ⏱️ **Timekeeping** — Daily attendance, clock-in/out
- 🏭 **Production Schedule** — Daily slaughter schedules
- 📅 **Shift Schedule** — Assign employees to shifts A/B/C/D
- 🌴 **Leave Records** — All leave types with approval tracking
- ⚠️ **Violations** — Rules library + violation records
- 📆 **Calendar** — Work days, holidays, rest days
- 🔔 **Notifications** — System and employee notifications
- 🔐 **Users** — Admin/user role management

## Getting Started

```bash
npm install
npm run dev
```

App runs on http://localhost:3000

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to **GitHub Actions**
4. Push to `main` branch — it auto-deploys

If using a custom domain, add a `CNAME` file in the `/public` folder:
```
yourdomain.com
```

Then set the DNS `A` records to GitHub Pages IPs:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

## Environment

The app connects directly to Base44 API App ID: `69fd933c4f54c69e74300a3f`

Authentication is handled via Base44's login endpoint — users must be registered in the Base44 app.

## Tech Stack

- **React 18** + Vite
- **Base44** backend (data, auth, entities)
- No external UI libraries — all custom components
