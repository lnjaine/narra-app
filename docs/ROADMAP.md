# Narra — Implementation Roadmap

## Overview

8-week sprint plan to go from zero to first live test. Each sprint is 2 weeks.

---

## Sprint 1: Foundation (Week 1-2)

**Goal:** Project setup, auth, and match catalog.

### Tasks
- [ ] Initialize Next.js 15 project with App Router
- [ ] Configure PWA (next-pwa or Serwist)
- [ ] Set up Supabase project (database, auth, realtime)
- [ ] Create database schema (users, events, streams, follows)
- [ ] Implement auth flow (Google social login via Supabase)
- [ ] Build event catalog:
  - [ ] Admin: create/edit matches manually
  - [ ] Public: browse upcoming and live matches
- [ ] Basic UI shell: navigation, match list, match detail page
- [ ] Deploy to Vercel (staging environment)

### Deliverables
- Working web app with login and match browsing
- Database populated with upcoming Brasileirao matches
- Deployed to staging URL

---

## Sprint 2: Audio Streaming (Week 3-4)

**Goal:** Core audio — narrator goes live, listener tunes in, with manual sync.

### Tasks
- [ ] Set up LiveKit Cloud account
- [ ] Implement LiveKit token generation (server-side API route)
- [ ] Narrator flow:
  - [ ] "Go Live" button on match page
  - [ ] Microphone capture + publish to LiveKit room
  - [ ] Live indicator + listener count
  - [ ] "End Stream" button
- [ ] Listener flow:
  - [ ] See available narrators for a match
  - [ ] Tap to join → receive audio from LiveKit
  - [ ] Audio playback with volume control
- [ ] Manual sync:
  - [ ] "Sync" button for narrator (marks reference point)
  - [ ] "Sync" button for listener (calculates offset)
  - [ ] Fine-tune slider (+/- 2 seconds)
- [ ] Background audio playback:
  - [ ] Web Audio API + Media Session API
  - [ ] Lock-screen controls (play/pause)
  - [ ] Test on iOS Safari + Chrome Android

### Deliverables
- End-to-end audio: narrator speaks → listener hears (< 1 sec latency)
- Manual sync working
- Background audio working on mobile browsers

---

## Sprint 3: Social & Discovery (Week 5-6)

**Goal:** Make it social and help listeners find the right narrator.

### Tasks
- [ ] Narrator profiles:
  - [ ] Profile page (bio, avatar, style tags, stats)
  - [ ] Edit profile flow
- [ ] Discovery:
  - [ ] "Narrators for this match" list on match page
  - [ ] Sort by: listener count, rating, style
  - [ ] "Trending narrators" section on home
- [ ] Follow system:
  - [ ] Follow/unfollow button on narrator profile
  - [ ] "My Narrators" page (followed narrators + their schedule)
- [ ] Live reactions:
  - [ ] Emoji reactions during stream (fire, laugh, goal, boo)
  - [ ] Reaction burst animation overlay
  - [ ] Reaction count visible to narrator
- [ ] Notifications:
  - [ ] Push notifications (Web Push API)
  - [ ] "Your narrator is going live" alerts
  - [ ] Match reminders
- [ ] Shareable cards:
  - [ ] "I'm listening to X on Narra" — OG image + link
  - [ ] Share to Twitter/Instagram/WhatsApp

### Deliverables
- Narrator discovery and profiles
- Follow + notification system
- Live reactions during streams
- Social sharing

---

## Sprint 4: Launch Prep (Week 7-8)

**Goal:** Polish, test, onboard narrators, and prepare for first live event.

### Tasks
- [ ] Landing page:
  - [ ] Hero: "Muta a TV. Escolhe a voz."
  - [ ] How it works (3-step visual)
  - [ ] Waitlist / early access signup
  - [ ] Narrator application form
- [ ] Narrator onboarding:
  - [ ] Identify and reach out to 5 football influencers
  - [ ] Create onboarding guide (how to narrate, best practices)
  - [ ] 1:1 test sessions with each narrator
- [ ] Quality & testing:
  - [ ] Load test: simulate 500 concurrent listeners on LiveKit
  - [ ] Sync accuracy testing across different streaming services
  - [ ] Mobile browser compatibility matrix (iOS Safari, Chrome, Samsung Internet)
  - [ ] PWA install flow testing
- [ ] Analytics:
  - [ ] Plausible for web analytics
  - [ ] Custom events: stream join, sync tap, reaction, follow
- [ ] Performance:
  - [ ] Lighthouse audit (PWA score, performance)
  - [ ] Audio latency benchmarking
- [ ] First live event plan:
  - [ ] Pick match (ideally a derby or high-stakes game)
  - [ ] Coordinate with narrators on promotion plan
  - [ ] Prepare real-time monitoring dashboard
  - [ ] Incident response plan (what if audio fails, etc.)

### Deliverables
- Production-ready web app
- Landing page live
- 3-5 narrators onboarded and tested
- First live event scheduled and promoted

---

## Post-Launch (Month 3+)

### Near-term improvements
- [ ] Audio fingerprinting sync (v2)
- [ ] Narrator analytics dashboard (listener trends, engagement)
- [ ] Recorded narrations (replay after match)
- [ ] Multi-language support (Spanish for LATAM expansion)
- [ ] Narrator clips (auto-generated highlights for social)

### Medium-term features
- [ ] Tipping with Pix (Brazilian instant payment)
- [ ] Narrator subscriptions (Stripe)
- [ ] Narra Premium tier
- [ ] Additional sports: UFC, F1, tennis
- [ ] React Native app (iOS + Android)

### Long-term vision
- [ ] AI-assisted sync (event-data feeds from Opta/Sportradar)
- [ ] AI-generated commentary option (text-to-speech from match data)
- [ ] Narrator marketplace (verified, exclusive deals)
- [ ] White-label for sports leagues / clubs
- [ ] International expansion (Argentina, Mexico, Spain, UK)

---

## Key Milestones

| Week | Milestone |
|------|-----------|
| 2 | Auth + match catalog deployed to staging |
| 4 | End-to-end audio streaming working |
| 6 | Social features + narrator discovery live |
| 8 | First live event with real narrators + listeners |
| 12 | 5K+ MAU, 20+ narrators |
| 24 | Monetization live, multi-sport |
