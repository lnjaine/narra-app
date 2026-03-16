# Narra — Go-to-Market Strategy

## Positioning

**Category:** Alternative sports audio / creator-driven live commentary

**Tagline:** "Muta a TV. Escolhe a voz." (Mute the TV. Choose the voice.)

**One-liner:** Narra lets you swap your TV's sports commentary for narrations by influencers, coaches, and friends — live, synced, and on your terms.

**Positioning statement:** Narra is not competing with broadcasters. It's a new layer on top of existing sports video. Just as Twitch didn't replace gaming — it added a commentary layer — Narra adds a commentary layer to sports.

---

## Target Market

### Beachhead: Brazilian Football Fans

**Primary persona:** 18-35 year old Brazilian football fans who:
- Are frustrated with mainstream commentary (Galvao Bueno, Casagrande, etc.)
- Already follow football influencers on YouTube, Twitter/X, Instagram
- Watch matches via streaming (Globoplay, Premiere, CazeTV, YouTube)
- Are comfortable with apps and digital audio (Spotify, podcasts)

**Why Brazil first:**
- Football is religion — 150M+ fans with deep emotional connection to commentary
- Strong and growing football influencer ecosystem (Flamengo Depressao, Desimpedidos, Cazé, etc.)
- High streaming adoption for sports (CazeTV proved demand for alternative commentary)
- Portuguese-language niche is defensible before global expansion
- Brasileirao runs Feb-Dec — long season for testing and iteration

**Market size estimate:**
- ~80M Brazilians watch football regularly
- ~30M watch via streaming
- ~5M actively follow football influencer content
- TAM for alternative commentary: 1-5M users in Brazil alone

---

## Go-to-Market Phases

### Phase 1: Proof of Concept (Month 1-2)

**Goal:** Validate that people will mute their TV and listen to alternative live commentary.

**Actions:**
1. Build MVP web app (PWA)
2. Recruit 3-5 narrators from Brazilian football Twitter/YouTube:
   - Target profiles: funny commentators, ex-player analysts, fan community leaders
   - Look at: Flamengo Depressao, Desimpedidos contributors, club-specific influencers
3. Pick a single high-profile match for the first live test:
   - Ideal: derby match (Fla-Flu, Corinthians vs Palmeiras, Grenal)
   - Coordinate with narrators to promote 48h before
4. Distribution: 100% through narrator's own channels
   - "Muta a Globo, ouve comigo" (Mute Globo, listen with me)
   - Instagram stories, Twitter threads, YouTube community posts
5. Measure: concurrent listeners, sync quality, retention, qualitative feedback

**Targets:**
- 100-500 concurrent listeners on first live test
- Qualitative signal: "this is way better than TV" reactions

### Phase 2: Creator-Led Growth (Month 3-6)

**Goal:** Build supply (narrators) and demand (listeners) through creator network effects.

**Actions:**
1. Onboard 20-50 narrators across top Brazilian clubs
   - Each major club should have 2-3 narrator options
   - Mix of styles: funny, technical, passionate fan, coach/analyst
2. Narrator brings audience = built-in distribution
   - Provide narrators with shareable assets (cards, links, promo clips)
   - "X listeners are tuned in" — social proof drives FOMO
3. Add social features:
   - Live reactions (goal celebrations, boo, laugh)
   - Real-time listener count (visible to all)
   - Post-match sharing: "I listened to the Fla-Flu with @narrator"
4. Narrator leaderboard and discovery:
   - "Trending narrators" for each match
   - Filter by style (funny / technical / fan)
5. Push notifications:
   - "Your favorite narrator is going live in 10 minutes"
   - Match reminders

**Targets:**
- 5,000-10,000 MAU
- 20-50 active narrators
- Average 3+ matches listened per user per month

### Phase 3: Monetization + Expansion (Month 6-12)

**Goal:** Generate revenue and expand beyond Brazilian football.

**Monetization rollout:**
1. **Tipping** — listeners send tips during live narrations (like Twitch bits)
   - Start with Pix (Brazil's instant payment) for zero-friction
   - Narra takes 20% platform fee
2. **Narrator subscriptions** — follow specific narrators for exclusive content
   - R$9.90/month per narrator
   - Includes: early access, exclusive pre/post-game analysis, subscriber-only chat
3. **Narra Premium** — platform-wide subscription
   - R$19.90/month
   - Ad-free, multi-narrator mixing (listen to 2 at once), replay archive

**Expansion:**
- Sports: UFC (huge in Brazil), F1 (Interlagos connection), tennis, NBA, volleyball
- Markets: Argentina, Mexico, Spain, Portugal, UK
- Content: beyond sports — eSports, award shows, political debates, reality TV

**Targets:**
- 50,000+ MAU
- R$50K+ monthly revenue (tips + subscriptions)
- 3+ sports supported

---

## Distribution Channels

| Channel | Role | Priority |
|---------|------|----------|
| **Creator-led** | Each narrator promotes to their audience. PRIMARY growth engine. | Critical |
| **Social virality** | "Listening to X right now" shareable cards during live matches | High |
| **Football Twitter/X** | Match-day engagement, memes, clips of funny narrations | High |
| **YouTube Shorts / TikTok / Reels** | Post-match highlight clips with alternative narration audio | Medium |
| **Fan communities** | Torcidas organizadas, Reddit (r/futebol), Discord servers | Medium |
| **Partnerships** | Football podcasts, sports media outlets, fan apps | Low (Phase 2+) |
| **Paid acquisition** | Instagram/YouTube ads targeting football fans | Low (Phase 3+) |

### The Creator Flywheel

```
More narrators → More match coverage → More listeners
      ↑                                        │
      │                                        ↓
More revenue ← More engagement ← Better experience
```

The key insight: **narrators are the distribution channel**. Every narrator Narra onboards comes with an existing audience. The platform doesn't need to acquire listeners from scratch — it needs to acquire narrators, and the listeners follow.

---

## Business Model

### Revenue Streams

| Stream | Model | Take Rate | Timeline |
|--------|-------|-----------|----------|
| Tipping | Per-transaction | 20% | Month 6 |
| Narrator subscriptions | Monthly recurring | 30% | Month 8 |
| Narra Premium | Monthly recurring | 100% (R$19.90) | Month 10 |
| Sponsored narrations | Per-event | 30% | Year 2 |
| Audio ads (free tier) | CPM | 100% | Year 2 |

### Unit Economics (Target, Year 1)

- Average revenue per narrator: R$2,000/month (tips + subs)
- Platform take (25% blended): R$500/month per active narrator
- 50 active narrators = R$25,000/month platform revenue
- + Narra Premium subscribers: 500 x R$19.90 = R$9,950/month
- **Total target Month 12: R$35,000/month (~$7,000 USD)**

### Cost Structure (MVP Phase)

| Cost | Monthly |
|------|---------|
| Vercel Pro | $20 |
| Supabase Pro | $25 |
| LiveKit Cloud | $50-200 (usage-based) |
| Domain + misc | $10 |
| **Total** | **~$100-250/month** |

---

## Competitive Landscape

| Player | What They Do | Why Narra is Different |
|--------|-------------|----------------------|
| CazeTV / YouTube | Alternative commentary via video stream | Narra is audio-only — works WITH any video source, not instead of it |
| Twitch watch-alongs | Streamers watch and comment on sports | Narra is audio-synced to broadcast; Twitch has its own video + legal issues |
| Traditional radio | AM/FM sports commentary | Not on-demand, no choice of narrator, no creator economy |
| Clubhouse / Twitter Spaces | Live audio discussions | Not synced to video; general purpose, not sports-specific |
| Second-screen apps (FotMob, etc.) | Stats and data during matches | Data layer, not audio layer — complementary, not competitive |

### Competitive Moat

1. **Network effects** — more narrators attract more listeners, and vice versa
2. **Legal blue ocean** — no broadcast rights needed; can't be blocked
3. **Creator lock-in** — narrators build audiences on Narra; switching costs increase over time
4. **Sync technology** — audio fingerprinting and event-data sync become a technical moat
5. **Community** — each narrator develops a micro-community (like Twitch streamers)

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Sync too difficult for users | Medium | High | Start manual; invest heavily in auto-sync by v2 |
| Broadcasters attempt legal action | Low | High | Audio layer is legally independent; seek legal opinion early |
| Narrators don't attract enough listeners | Medium | High | Curate high-quality narrators; help them promote; make the experience magical |
| Users prefer video commentary (CazeTV model) | Medium | Medium | Audio-only is complementary — some users want both video quality + narrator choice |
| WebRTC latency issues | Low | High | LiveKit is battle-tested; extensive pre-launch testing |
| Narrator quality inconsistent | High | Medium | Rating system, featured/verified narrators, community moderation |
| Market too niche | Low | Medium | Brazil football alone is massive; expand sports/markets later |
