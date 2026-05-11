# TRÆCERA 🌍🟣
**Live App**: [https://tr-cera.vercel.app/](https://tr-cera.vercel.app/) 
**Track the Rise of Solana in Africa.**

TRÆCERA is Africa's first intelligence layer for discovering, 
tracking, and analyzing projects building on the Solana ecosystem. 
We index real African-built products with verified data, honest 
analytics, and one unified ecosystem dashboard built for the 
continent's growing builder community.

> "Don't just list projects → dissect them."

---

## 🚀 Overview

TRÆCERA is not a directory. It is an intelligence platform.

Built Africa-first — not global-first — TRÆCERA maps the fastest 
growing decentralized applications, fintech products, and 
infrastructure tools being built across the African continent 
on Solana.

We currently index **60+ verified African Solana projects** across 
Nigeria and expanding to Kenya, Ghana, South Africa, Egypt and 
beyond. Every project on TRÆCERA goes through a multi-level 
verification framework before being listed.

---

## ✨ Key Features

- **🏆 Ecosystem Rankings**: Dynamic leaderboard tracking African 
  Solana projects by Træcera Score, active users, and 30-day growth.

- **🔍 Deep Filtering & Search**: Explore by Category (Gateway, 
  DeFi, Payments, Infrastructure, Gaming, Social Commerce, 
  Creator Economy, Security, Analytics, AI+Crypto, RWA), 
  Status (Live, Beta, Coming Soon), and Country.

- **📈 Advanced Project Dashboards**: Deep-dive intelligence 
  profiles for each project showing all 3 core pillars.

- **🛡️ Proprietary Træcera Methodology**:
  - *Advanced Analytics*: Transaction volume, user activity, 
    growth trends, on-chain performance
  - *Project Intelligence*: Team info, funding rounds, ecosystem 
    positioning, product scope and use case
  - *Tracking & Monitoring*: Real-time updates and performance 
    tracking for projects

- **✅ 4-Level Verification Framework**:
  - Level 1 — Social Verification
  - Level 2 — Product Verification  
  - Level 3 — Ecosystem Verification
  - Level 4 — On-Chain Verification

- **🟣 Træcera Score**: Proprietary scoring algorithm rating each 
  project 0-100 based on on-chain activity, growth, developer 
  activity, and trust signals.

- **📱 Immersive UI/UX**: Built with Next.js, Tailwind CSS, 
  and Framer Motion for a cinematic dark-themed experience.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **On-Chain Data**: Helius API
- **Logo Resolution**: Unavatar API + Clearbit API

---

## 🔗 On-Chain Metrics Pipeline (Helius + Supabase)

Server-side endpoints for live on-chain metrics:

- `GET /api/helius/[address]` — fetches Helius transactions 
  for a verified program address and computes:
  - `transaction_volume` (USDC total)
  - `active_users` (unique wallets)
  - `volume_24h` (USDC in last 24h)
  - `growth_percent` (last 30d vs previous 30d)

- `GET /api/cron/helius-refresh` — loops all verified project 
  program addresses from Supabase and refreshes metrics daily.

Daily cron configured via `vercel.json`.
Environment variables documented in `.env.example`.
Supabase migration at:
`supabase/migrations/20260505162500_add_helius_metrics.sql`

---

## 📊 Data Integrity

TRÆCERA takes data honesty seriously.

Every metric on the platform is labeled with its source:

| Label | Meaning |
|-------|---------|
| `ONCHAIN VERIFIED` | Confirmed via Helius API |
| `REPORTED` | Provided by project team |
| `ESTIMATED` | Calculated from public signals |
| `MOCK` | Placeholder data only |

We never present unverified data as real. 
Accuracy over hype. Always.

---

## 🗄️ Database Schema

Three core tables power TRÆCERA:

- `projects` — main project registry with full intelligence profile
- `project_metrics_snapshots` — daily on-chain metrics history
- `submitted_projects` — project submission pipeline

---

## 💻 Run Locally

**Prerequisites:** Node.js v18+

1. Clone the repository:
```bash
   git clone https://github.com/dexdivine9-source/Tr-cera.git
   cd TRACERA
```

2. Install dependencies:
```bash
   npm install
```

3. Set up environment variables:
```bash
   cp .env.example .env.local
```
   Fill in your keys:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `HELIUS_API_KEY`
   - `GEMINI_API_KEY`
   - `CRON_SECRET`

4. Start dev server:
```bash
   npm run dev
```

5. Open `http://localhost:3000`

---

## 🤝 Submit Your Project

Are you an African founder building on Solana?

Get your project indexed on TRÆCERA with a full 
intelligence profile.

→ Use the **Submit Project** flow inside the app
→ Our team reviews within 48 hours
→ Verified projects get full analytics dashboard

---

## 🌍 Coverage

TRÆCERA is Africa-first. Not Nigeria-first.

Currently indexing projects from:
- 🇳🇬 Nigeria
- 🇰🇪 Kenya (expanding)
- 🇬🇭 Ghana (expanding)
- 🇿🇦 South Africa (expanding)
- 🇪🇬 Egypt (expanding)
- And more across the continent

---

## 🔮 Roadmap

- [ ] On-chain program address verification for all projects
- [ ] Claim Your Project — founders verify their own profiles
- [ ] Expand to 5+ African countries
- [ ] Træcera API — sell ecosystem data to researchers and VCs
- [ ] Weekly ecosystem intelligence reports
- [ ] Mobile app

---

## 👥 Team

Built by African founders for the African ecosystem.

- **Founder & Developer**: @MaskilSOL
- **Co-Founder**: @callmeFeyi_

---

*TRÆCERA is not just a platform. 
It is infrastructure for Africa's Solana ecosystem.*

*Africa is the emerging epicenter. 🟣*
