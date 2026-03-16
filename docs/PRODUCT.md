# Narra — Product Spec

## Vision

Narra creates a new content category: **alternative live audio commentary for sports**. Just as streaming liberated video from broadcast schedules, Narra liberates commentary from broadcaster monopolies.

Users mute their TV. They open Narra. They pick a narrator. They hear the match the way they want to hear it.

## The Insight

Audio is technically separate from video — it's synchronized but not the same thing. A broadcaster owns the video feed, but they don't own what comes out of your speakers. This is a legal and technical blue ocean: nobody can stop you from muting your TV and playing a different audio stream.

Traditional radio was strong in sports narration, but it never evolved into a streaming/on-demand model (except for music via Spotify). There is no "Spotify of sports commentary." Narra fills that gap.

## Proof of Demand

- Millions of fans already mute their TVs because they dislike mainstream commentators
- Channels like **Flamengo Depressao** ("Narracao Sarrante") go viral by overlaying funny/alternative commentary on match highlights
- Sports podcasts and watch-along content are among the fastest-growing categories
- Twitch proved that live commentary layers on top of existing content create massive engagement

---

## User Flows

### Listener Flow

```
Open Narra → Browse live matches → See available narrators for each match
    → Pick narrator → Tap "Sync" on kickoff → Mute TV → Listen
    → React (emojis, chat) → Tip narrator → Follow for next match
```

### Narrator Flow

```
Open Narra → Select upcoming match → Set stream title & description
    → Tap "Go Live" at match start → Narrate into phone mic
    → See live listener count + reactions → End stream
    → View stats (peak listeners, tips, new followers)
```

### Sync Mechanism (Evolution)

| Version | How It Works | Accuracy |
|---------|-------------|----------|
| v1 (MVP) | **Manual sync** — narrator and listener both tap a button on a visible event (kickoff, first serve). App calculates offset. | ~1-2 sec |
| v2 | **Audio fingerprinting** — app briefly listens to TV audio, matches against a reference stream, auto-calculates offset | ~200ms |
| v3 | **Event-data sync** — tie to official match clock / data feeds (Opta, Sportradar). Most reliable for structured sports. | ~100ms |

---

## Core Features

### For Listeners
- **Match browser:** See all live and upcoming matches across supported sports
- **Narrator discovery:** Browse narrators per match, sorted by rating/listeners/style
- **One-tap listen:** Select narrator → audio starts playing (with sync)
- **Background audio:** Keep listening while phone is locked or in another app
- **Social:** Live reactions, listener count, chat
- **Follow:** Get notified when your favorite narrators go live
- **Tipping:** Send tips during live narrations

### For Narrators
- **Go Live:** One-tap to start broadcasting on a match
- **Dashboard:** Real-time listener count, reactions, engagement metrics
- **Profile:** Bio, sports/teams, commentary style (funny, technical, fan, coach)
- **Earnings:** Track tips, subscriber revenue, payouts
- **Clips:** Auto-generate highlight clips for social sharing

### For Both
- **Match schedule:** Auto-populated calendar of upcoming events
- **Notifications:** Match reminders, narrator going live, new followers

---

## Data Model

```sql
-- Users (both listeners and narrators)
users (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  role ENUM('listener', 'narrator', 'both'),
  bio TEXT,
  created_at TIMESTAMP
)

-- Sports events (matches, fights, races)
events (
  id UUID PRIMARY KEY,
  sport TEXT,           -- football, tennis, ufc, f1
  league TEXT,          -- brasileirao, premier-league, atp
  title TEXT,           -- "Flamengo vs Fluminense"
  home_team TEXT,
  away_team TEXT,
  start_time TIMESTAMP,
  status ENUM('scheduled', 'live', 'finished'),
  external_id TEXT      -- for API integrations
)

-- Live audio streams
streams (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events,
  narrator_id UUID REFERENCES users,
  title TEXT,           -- "Narracao Sarrante do Mengao"
  status ENUM('scheduled', 'live', 'ended'),
  listener_count INT DEFAULT 0,
  peak_listeners INT DEFAULT 0,
  sync_offset_ms INT,  -- offset relative to broadcast
  started_at TIMESTAMP,
  ended_at TIMESTAMP
)

-- Active listeners
listeners (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  stream_id UUID REFERENCES streams,
  joined_at TIMESTAMP,
  left_at TIMESTAMP
)

-- Live reactions
reactions (
  id UUID PRIMARY KEY,
  stream_id UUID REFERENCES streams,
  user_id UUID REFERENCES users,
  type TEXT,            -- 'fire', 'laugh', 'goal', 'boo'
  created_at TIMESTAMP
)

-- Follow relationships
follows (
  follower_id UUID REFERENCES users,
  narrator_id UUID REFERENCES users,
  created_at TIMESTAMP,
  PRIMARY KEY (follower_id, narrator_id)
)

-- Tips / payments
tips (
  id UUID PRIMARY KEY,
  stream_id UUID REFERENCES streams,
  from_user_id UUID REFERENCES users,
  to_narrator_id UUID REFERENCES users,
  amount_cents INT,
  currency TEXT DEFAULT 'BRL',
  created_at TIMESTAMP
)
```

---

## MVP Scope (v0.1)

### In Scope
- Web app (PWA) — no native app yet
- Single sport: Brazilian football (Brasileirao / Copa do Brasil)
- Manual sync (tap-on-kickoff)
- WebRTC audio streaming via LiveKit
- Manually curated match schedule
- 5-10 invited narrators (influencer partnerships)
- Basic narrator profiles and discovery
- Live listener count
- Background audio playback

### Out of Scope (v0.1)
- Native iOS/Android apps
- Audio fingerprinting auto-sync
- Tipping / monetization
- Chat / reactions
- Multi-sport support
- Narrator analytics dashboard
- Recorded/replay narrations
- AI-generated commentary

---

## Success Metrics (MVP)

| Metric | Target |
|--------|--------|
| Concurrent listeners (first live test) | 100-500 |
| Sync accuracy (manual) | < 2 seconds offset |
| Audio latency (narrator → listener) | < 1 second |
| Listener retention (stay for full match) | > 40% |
| Narrator NPS | > 50 |
