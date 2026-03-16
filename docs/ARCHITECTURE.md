# Narra — Technical Architecture

## System Overview

```
┌─────────────────┐          ┌──────────────────┐          ┌─────────────────┐
│   Narrator       │          │   Narra Backend   │          │   Listener       │
│   (Browser/PWA)  │          │                    │          │   (Browser/PWA)  │
│                  │          │  ┌──────────────┐  │          │                  │
│  Mic capture ────┼────────▶│  │  LiveKit SFU  │  │────────▶│  Audio playback  │
│  Go Live UI      │  WebRTC  │  │  (audio relay)│  │ WebRTC  │  Sync controls   │
│  Stats dashboard │          │  └──────────────┘  │          │  Reactions UI    │
│                  │          │                    │          │                  │
│  ┌────────────┐  │          │  ┌──────────────┐  │          │  ┌────────────┐  │
│  │ LiveKit SDK│  │          │  │  Next.js API  │  │          │  │ LiveKit SDK│  │
│  └────────────┘  │          │  │  Routes       │  │          │  └────────────┘  │
└─────────────────┘          │  └──────┬───────┘  │          └─────────────────┘
                              │         │          │
                              │  ┌──────▼───────┐  │
                              │  │  Supabase     │  │
                              │  │  - Postgres   │  │
                              │  │  - Auth       │  │
                              │  │  - Realtime   │  │
                              │  └──────────────┘  │
                              └──────────────────┘
```

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 15 (App Router) + PWA | SSR for SEO, PWA for mobile-like experience, React ecosystem |
| **Audio streaming** | LiveKit (WebRTC SFU) | Open-source, sub-second latency, 1-to-many broadcasting, SDKs for web |
| **Backend API** | Next.js API Routes (or Hono) | Co-located with frontend, serverless-friendly |
| **Database** | Supabase (PostgreSQL) | Managed Postgres + built-in Auth + Realtime subscriptions |
| **Auth** | Supabase Auth | Social login (Google, Apple), JWT, Row-Level Security |
| **Realtime** | Supabase Realtime + LiveKit data channels | Listener counts, reactions, sync signals |
| **Hosting** | Vercel | Zero-config Next.js deploys, edge functions, global CDN |
| **Audio infra** | LiveKit Cloud | Managed WebRTC SFU, pay-per-usage, global edge nodes |
| **Payments** | Stripe + Pix (Brazil) | Tips and subscriptions |
| **Analytics** | Plausible or Mixpanel | Privacy-friendly web analytics + product analytics |

---

## Key Components

### 1. Audio Streaming (LiveKit)

LiveKit acts as a Selective Forwarding Unit (SFU) — the narrator publishes one audio stream, and LiveKit distributes it to all listeners without the narrator needing to send multiple streams.

**Flow:**
1. Narrator joins a LiveKit room as a **publisher** (audio only, no video)
2. Listeners join the same room as **subscribers** (receive audio only)
3. LiveKit handles all WebRTC negotiation, ICE candidates, TURN/STUN
4. Latency: typically 100-500ms end-to-end

**Why LiveKit over alternatives:**
- Open-source (can self-host later for cost optimization)
- Purpose-built for 1-to-many audio/video
- Excellent web SDK (@livekit/components-react)
- Data channels for sync signals and reactions
- LiveKit Cloud for managed hosting (no infra to manage for MVP)

**Room naming convention:** `{event_id}:{narrator_id}` (e.g., `fla-flu-2026-03-20:narrator-juan`)

### 2. Sync Mechanism

The hardest technical challenge. We take an iterative approach:

#### v1: Manual Sync (MVP)
```
1. Narrator presses "SYNC" button when a visible event happens (kickoff)
2. Listener presses "SYNC" button when they see the same event on their TV
3. App calculates: offset = listener_tap_time - narrator_tap_time
4. Audio playback is delayed/advanced by the offset
5. Fine-tune: listener can adjust +/- 500ms with slider
```

**Trade-offs:** Simple to build, works across any broadcast. Requires user action. ~1-2s accuracy.

#### v2: Audio Fingerprinting (Post-MVP)
```
1. Listener's app briefly captures TV audio via phone mic (3-5 seconds)
2. Generate audio fingerprint (Chromaprint / Dejavu algorithm)
3. Compare against reference stream fingerprint (from known broadcast)
4. Calculate exact offset from fingerprint match
5. Auto-apply offset to audio playback
```

**Trade-offs:** Automatic, more accurate (~200ms). Requires reference audio source. Privacy considerations.

#### v3: Event-Data Sync (Future)
```
1. Integrate with sports data APIs (Opta, Sportradar, football-data.org)
2. Use official match clock as shared reference
3. Narrator stream is tagged with match-clock timestamps
4. Listener's broadcast delay is detected and compensated
```

**Trade-offs:** Most accurate and reliable. Requires data partnerships. Works best for structured sports.

### 3. Background Audio (PWA)

Critical for mobile UX — users must be able to lock their phone or switch apps while audio plays.

**Approach:**
- Service Worker + Web Audio API for background playback
- Media Session API for lock-screen controls (play/pause, skip narrator)
- `<audio>` element as fallback for WebRTC audio output
- Test extensively on iOS Safari (most restrictive) and Chrome Android

**Known limitations:**
- iOS Safari: aggressive about killing background audio; Media Session API helps
- Some browsers require user gesture to start audio
- PWA install prompt improves background reliability

### 4. Database Schema (Supabase)

See [PRODUCT.md](PRODUCT.md) for the full data model. Key architectural decisions:

- **Row-Level Security (RLS):** Users can only read/write their own data; streams are publicly readable
- **Realtime subscriptions:** Listener count updates via Supabase Realtime (subscribe to `streams.listener_count`)
- **Indexes:** `events(start_time, status)`, `streams(event_id, status)`, `follows(follower_id)`
- **Soft deletes:** Streams are never deleted, just marked `ended`

### 5. API Routes

```
POST   /api/auth/login          — Social login (Google/Apple)
GET    /api/events              — List upcoming/live events
GET    /api/events/:id          — Event detail + available streams
POST   /api/streams             — Create new stream (narrator)
PATCH  /api/streams/:id         — Update stream (go live, end)
GET    /api/streams/:id         — Stream detail + listener count
POST   /api/streams/:id/sync    — Submit sync tap (narrator or listener)
POST   /api/streams/:id/react   — Send reaction
GET    /api/narrators           — Browse narrators
GET    /api/narrators/:id       — Narrator profile + stats
POST   /api/follows             — Follow a narrator
DELETE /api/follows/:id         — Unfollow
POST   /api/livekit/token       — Generate LiveKit access token (server-side)
```

---

## Infrastructure

### MVP (Month 1-3)

```
Vercel (Frontend + API)  ←→  Supabase Cloud (DB + Auth + Realtime)
         ↕
    LiveKit Cloud (Audio SFU)
```

**Cost:** ~$100-250/month
**Scale:** Handles ~1,000 concurrent listeners easily

### Growth (Month 3-12)

```
Vercel Pro (Frontend + Edge Functions)
         ↕
Supabase Pro (Connection pooling, more storage)
         ↕
LiveKit Cloud (Auto-scaling, multiple regions)
         ↕
Redis (Upstash) — Caching, rate limiting, live state
         ↕
Stripe — Payments processing
```

**Cost:** ~$500-1,000/month
**Scale:** Handles ~10,000 concurrent listeners

### Scale (Year 2+)

- Self-hosted LiveKit on dedicated servers (cost optimization at scale)
- Multi-region deployment (Brazil, Argentina, Europe)
- CDN for recorded narrations (Cloudflare R2 or S3)
- Dedicated analytics pipeline

---

## Security Considerations

- **Auth:** Supabase Auth with social providers; JWTs for API auth; RLS for data access
- **LiveKit tokens:** Generated server-side only; scoped to specific rooms with time expiry
- **Rate limiting:** Upstash Redis rate limiter on API routes
- **Audio abuse:** Moderation tools for reporting inappropriate narrations
- **Data privacy:** Minimal data collection; LGPD compliance (Brazil's data protection law)
- **Payment security:** Stripe handles all payment data; no PCI scope

---

## Monitoring & Observability

| What | Tool |
|------|------|
| Web analytics | Plausible (privacy-friendly) |
| Product analytics | Mixpanel or PostHog |
| Error tracking | Sentry |
| Uptime | Vercel built-in + BetterUptime |
| Audio quality | LiveKit dashboard (quality metrics, latency) |
| Database | Supabase dashboard (query performance, connections) |
