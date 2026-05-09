<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# TRÆCERA 🌍🔆

**Live App**: [https://tr-cera.vercel.app/](https://tr-cera.vercel.app/) | **Track the Rise of Solana in Africa.** 

TRÆCERA is the premier ecosystem platform to discover, track, and analyze 140+ African-built projects and applications launching on the Solana frontier. We provide real data, live tracking, and one unified ecosystem dashboard to highlight the most promising teams on the continent.

---

## 🚀 Overview

TRÆCERA leverages **Momentum Intelligence** and **On-Chain Velocity** to map out the fastest-growing decentralized applications built across Africa. This platform is designed to spotlight true ecosystem leaders by assessing user activity, transaction volume, and verified trust factors locally and globally.

## ✨ Key Features

- **🏆 Ecosystem Rankings**: A dynamic leaderboard tracking 140+ African Solana projects based on active users and 30-day growth.
- **🔍 Deep Filtering & Search**: Explore the ecosystem by Category (DeFi, Infrastructure, etc.), Status (Live, Beta, Coming Soon), and Origin Country.
- **📈 Advanced Project Dashboards**: Deep-dive into project charts built with Recharts, highlighting 6-month user adoption trends and transaction volume.
- **🛡️ Proprietary Træcera Methodology**:
  - *Momentum Intelligence*: Tracks social sentiment, commits, and organic community growth.
  - *Trust Verification*: Prioritizes audited projects, local FIAT integrations, and doxxed teams.
  - *On-Chain Velocity*: Evaluates continued and efficient on-chain engagement.
- **📱 Immersive UI/UX**: Crafted with React, Tailwind CSS, and Framer Motion for buttery-smooth cross-device glassmorphism layouts.

## 🛠️ Tech Stack 

- **Frontend Framework**: React 19 (TypeScript)
- **Styling Pipeline**: Tailwind CSS v4
- **Animations**: Motion (formally Framer Motion) 
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Framework Runtime**: Next.js (App Router)

## 🔗 On-chain Metrics Pipeline (Helius + Supabase)

Server-side endpoints are available for live on-chain metrics:

- `GET /api/helius/[address]`: fetches Helius transactions for a program address, computes:
  - `transaction_volume` (USDC total)
  - `active_users` (unique wallets)
  - `volume_24h` (USDC in last 24h)
  - `growth_percent` (last 30d vs previous 30d)
- `GET /api/cron/helius-refresh`: loops all project program addresses from Supabase and refreshes metrics.

Daily cron is configured via `vercel.json` on `/api/cron/helius-refresh`.

Required environment variables are documented in `.env.example`.

Supabase migration for this pipeline is included at:

- `supabase/migrations/20260505162500_add_helius_metrics.sql`

## 💻 Run Locally

**Prerequisites:**  Node.js (v18+ recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/dexdivine9-source/Tr-cera.git
   cd TRACERA
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. View the app: 
   Open `http://localhost:3000` in your browser to interact with the platform.

## 🤝 Project Submissions

Are you an African founder building on Solana? Want to feature your project on our leaderboard? Use the **Submit Project** flow implemented within the app to get audited and added to our real-time database!

---
*Built to accelerate the African Web3 Ecosystem.*
