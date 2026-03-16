# Narra

**Muta a TV. Escolhe a voz.**

Narra is a platform that lets you replace default sports commentary with alternative audio narrations — live, synced, and on your terms.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router, PWA) |
| Audio Streaming | LiveKit (WebRTC SFU) |
| Backend | Next.js API Routes |
| Database | Supabase (Postgres + Auth + Realtime) |
| Hosting | Vercel + LiveKit Cloud |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [LiveKit Cloud](https://livekit.io) account

### Setup

1. Clone and install dependencies:
```bash
git clone https://github.com/lnjaine/narra-app.git
cd narra-app
npm install
```

2. Copy env file and fill in your credentials:
```bash
cp .env.local.example .env.local
```

3. Run the database schema in your Supabase SQL Editor:
```
supabase/schema.sql
```

4. Enable Google Auth in Supabase Dashboard > Authentication > Providers

5. Start the dev server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── api/            # API routes (LiveKit token, streams)
│   ├── auth/           # Auth callback
│   ├── listen/[id]/    # Listener experience
│   ├── login/          # Login page
│   ├── matches/        # Match catalog
│   ├── narrators/      # Narrator discovery + profiles
│   ├── profile/        # User profile
│   ├── studio/[id]/    # Narrator broadcasting studio
│   ├── layout.tsx      # Root layout with nav
│   └── page.tsx        # Landing page
├── components/
│   ├── layout/         # Header, BottomNav
│   ├── narrator/       # FollowButton
│   ├── stream/         # StreamList, ListenerView, NarratorStudio
│   └── ui/             # Button, Badge
├── lib/
│   ├── hooks/          # useAuth, useSync
│   └── supabase/       # Client, server, middleware
├── types/              # Database types
└── middleware.ts        # Auth session refresh
```

## Key Features (MVP)

- **Match catalog**: Browse upcoming and live Brazilian football matches
- **Narrator discovery**: Find narrators by style (funny, technical, fan, coach)
- **Go Live**: Narrators broadcast audio via LiveKit WebRTC
- **Listen**: Listeners receive real-time audio with < 1s latency
- **Manual sync**: Tap-based sync between narrator and TV broadcast
- **Follow system**: Follow favorite narrators
- **PWA**: Installable, background audio support
- **Mobile-first**: Responsive design with bottom navigation
