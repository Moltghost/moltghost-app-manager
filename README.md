# Moltghost App Manager

A web-based deployment manager for spinning up AI agent instances on GPU infrastructure. Authenticate with your wallet, configure an agent, and launch it in a few clicks.

**Live demo → [moltghost-app-manager.vercel.app](https://moltghost-app-manager.vercel.app/)**

---

## Features

- **Wallet-based auth** via Solana wallet adapter — no username/password required
- **5-step deployment wizard**
  1. Welcome / overview
  2. Choose deployment mode — *Dedicated*, *Shared*, or *External*
  3. Select an AI model (fetched from the database, VRAM requirements shown)
  4. Configure agent settings — skills, memory, behavior, notifications, auto-sleep
  5. Review & deploy — streams live status while the pod spins up
- **RunPod integration** — GPU pricing fetched live from the RunPod GraphQL API
- **Persistent deployments** stored in a Neon Postgres database via Drizzle ORM
- **Glassmorphism UI** built with Tailwind CSS v4

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Auth | Solana wallet adapter + JWT |
| Database | PostgreSQL (via pg driver) |
| ORM | Drizzle ORM |
| GPU infra | RunPod GraphQL API |
| Deployment | Vercel |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the root:

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:4000

# Solana RPC
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# RunPod
RUNPOD_API_KEY=your_runpod_api_key
```

### 3. Run database migrations & seed

```bash
npm run db:migrate
npm run db:seed
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Scripts

| Command | Description |
|---|---|
| `npm run db:generate` | Generate a new Drizzle migration |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed the models table |

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
