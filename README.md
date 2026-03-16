# Narra

**Muta a TV. Escolhe a voz.**

Narra is a platform that lets you replace default sports commentary with alternative audio narrations — from your favorite influencers, friends, coaches, or anyone with a microphone and an opinion.

## The Problem

The content revolution transformed video: we went from broadcast TV schedules to Netflix, Disney+, and on-demand streaming. You choose what to watch, when to watch it.

But audio commentary never had the same revolution. You're still stuck with whoever the broadcaster picked. Hate the commentator? Your only option is muting the TV.

## The Solution

Narra decouples audio from video. Users mute their TV and tune into alternative live commentary synced to the match they're watching. No broadcast rights needed — it's a new, independent audio layer.

- **Listeners** pick their favorite narrator for any live match
- **Narrators** build audiences by streaming their own commentary
- **Sync** keeps audio aligned with what's on screen

Think of it as the **Spotify of sports commentary** — or what Twitch did for gaming, but for the audio layer of any sport.

## Why Now

- Almost all sports viewing is now via streaming (easy to sync audio)
- Creator economy is massive — narrators are the next influencer category
- No legal barrier: broadcasters cannot block users from muting and playing their own audio
- Proof of demand: channels like "Flamengo Depressao" go viral with alternative narrations

## Docs

- [Product Spec](docs/PRODUCT.md) — Full product vision, user flows, and MVP scope
- [GTM Strategy](docs/GTM.md) — Go-to-market phases, distribution, and monetization
- [Architecture](docs/ARCHITECTURE.md) — Technical stack and system design
- [Roadmap](docs/ROADMAP.md) — Sprint-by-sprint implementation plan

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (PWA) |
| Audio Streaming | LiveKit (WebRTC SFU) |
| Backend | Next.js API Routes |
| Database | Supabase (Postgres + Auth + Realtime) |
| Hosting | Vercel + LiveKit Cloud |

## Status

**Phase:** Product definition & planning. Code coming soon.
