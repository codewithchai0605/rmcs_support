# Raja Mantri Chor Sipahi — Support Button (Next.js 16)

Next.js 16 (App Router) + Server Actions + MongoDB/Mongoose rewrite of the
plain HTML/Express version. Same behavior: watch an ad to support the game,
capped at 5/day per browser, with the important postback data stored in
MongoDB.

## Why the architecture looks the way it does

- **The page is a Server Component.** It reads today's ad count straight
  from MongoDB during render, so there's no client-side "loading…" flash —
  the count is correct on first paint.
- **A cookie identifies the supporter, not localStorage.** Server Components
  can't read localStorage during server-side rendering, but they can read
  cookies — that's what makes the instant-correct first paint above possible.
  It's minted lazily on the first click.
- **`requestAdAttempt` is a Server Action** (`app/actions.ts`, `"use server"`).
  It's called directly from the button's click handler (not a `<form>`,
  since we need to call the Monetag SDK — which needs `window` — in between
  the action resolving and showing the result). It re-checks the daily limit
  itself; the client can't be trusted to enforce it.
- **The Monetag postback is a Route Handler, not a Server Action.**
  Server Actions can only be invoked by your own app's React code — Monetag's
  servers can't call one directly. A plain `GET` Route Handler
  (`app/api/postback/monetag/route.ts`) is the correct tool for any endpoint
  called by an external HTTP client.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in:
   - `MONGODB_URI` — local `mongod` or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
   - `POSTBACK_SECRET` — a long random string
   - `NEXT_PUBLIC_MONETAG_ZONE_ID` and `NEXT_PUBLIC_MONETAG_SDK_URL` — copy the
     exact Rewarded Interstitial tag for this zone from your Monetag
     dashboard (the SDK domain can differ per account, so copy it rather
     than guessing)
3. `npm run dev`, then open `http://localhost:3000`
4. In your Monetag dashboard, set the postback URL to:
   ```
   https://YOUR_DOMAIN/api/postback/monetag?secret=YOUR_POSTBACK_SECRET&ymid={ymid}&zone_id={zone_id}&sub_zone_id={sub_zone_id}&request_var={request_var}&event_type={event_type}&reward_event_type={reward_event_type}&estimated_price={estimated_price}
   ```

## What's stored in MongoDB

- **AdAttempt** (`lib/models/AdAttempt.ts`) — one document per ad request:
  `ymid`, `supporterId`, `status`, `expiresAt`. This is what the 5-per-day
  limit counts against.
- **AdEvent** (`lib/models/AdEvent.ts`) — one document per confirmed
  postback: `ymid`, `supporterId`, `eventType` (impression/click),
  `rewardEventType` (valued/not_valued), `estimatedPrice`, `zoneId`,
  `subZoneId`, `requestVar`. Indexed uniquely on `(ymid, eventType)` — a
  single ad can produce both an impression and a click postback for the same
  `ymid`, and deduping on `ymid` alone would silently drop the second one.

Nothing here pays the *user* — it just tracks daily ad views and records
what Monetag reports back for your own records.

## Known limitation (by design, for simplicity)

The supporter cookie is just a value the server hands out on first visit —
there's no account or login. Anyone can bypass the 5/day limit by clearing
cookies or using a different browser. That's an acceptable trade-off for a
simple "please support us" button.

## A note on Mongoose + Next.js

`lib/mongodb.ts` calls `mongoose.connect()` on every request rather than
manually caching a connection promise — as of Mongoose 8+/9+, calling
`connect()` when already connected is a safe no-op, so this is the officially
recommended pattern now (see [Mongoose's Next.js guide](https://mongoosejs.com/docs/nextjs.html)),
simpler than the older `globalThis`-cached-promise pattern you'll see in
older tutorials.

`next.config.ts` marks `mongoose` as a `serverExternalPackage` to avoid a
known bundling error with its underlying `bson` parser (also documented on
that page).
