# Lore

The world has stories. Tap to hear them.

A pocket audio guide. Stand near any monument or building, tap one button, hear a thoughtful explainer about what you're looking at — sourced from OpenStreetMap and Wikipedia, narrated by ElevenLabs, saved to your trip journal.

## Stack
- **Front-end:** vanilla HTML/JS, PWA (manifest + service worker)
- **Hosting:** Vercel (this repo)
- **Auth + DB + storage:** Supabase
- **API:** Cloudflare Worker (see /backend in the parent project folder)
- **AI scripts:** Anthropic Claude
- **Premium voice:** ElevenLabs (Nathaniel)
- **Place lookup:** OpenStreetMap Overpass + Wikipedia + Wikidata (free)

## Files
- `index.html` — the app
- `route.html` — public route view (`/r/<token>`)
- `manifest.webmanifest`, `sw.js`, `icon.svg`, `icon-maskable.svg` — PWA shell
- `vercel.json` — routing config

## Deploy
Pushed to https://github.com/BruceWillisFromDieHard/lore and auto-deployed by Vercel.
