```
  ██████  ██████   █████  ███    ██ ███    ██ ██    ██
 ██       ██   ██ ██   ██ ████   ██ ████   ██  ██  ██
 ██   ███ ██████  ███████ ██ ██  ██ ██ ██  ██   ████
 ██    ██ ██   ██ ██   ██ ██  ██ ██ ██  ██ ██    ██
  ██████  ██   ██ ██   ██ ██   ████ ██   ████    ██
```

> *Don't make any noise. She'll hear you.*

WebGL browser port of **Granny** by [DVloper](https://www.dvloper.com).
Port by **Ducky** — hosted on Cloudflare Pages, assets on Supabase Storage.

---

## Stack

| Layer | Service |
|---|---|
| Hosting | Cloudflare Pages |
| Asset storage | Supabase Storage (`secret-granny-game` bucket) |
| Local dev | `node server.js` |

---

## Access Tokens

Share these privately. Each token unlocks the gate screen.

| Token | — |
|---|---|
| `AT-8F0L-1QZN` | — |
| `AT-4D9K-83M2` | — |
| `AT-IV5O-3UX8` | — |
| `AT-V7PR-4LLP` | — |

To add more, open `index.html` and add to the `TOKENS` set at the top of the `<script>`.

---

## Local Development

Requires [Node.js](https://nodejs.org) — no install step, no dependencies.

```bash
git clone <your-repo>
cd Granny-main
node server.js
```

Open **http://localhost:3000** — or the Network address printed in the terminal to access from another device (e.g. a Chromebook on the same WiFi).

> `server.js` auto-combines any `.part01/.part02` split files on first run,
> sets the required COOP/COEP headers, and serves correct MIME types for `.wasm`.
> Only needed locally — Cloudflare handles headers in production via `_headers`.

---

## Deploying to Cloudflare Pages

1. Push the repo to GitHub (make sure `.env.local` is in `.gitignore`)
2. Go to [Cloudflare Pages](https://pages.cloudflare.com) → **Create a project** → connect your repo
3. Build settings: leave **Framework preset** as *None*, **build command** blank, **output directory** as `/` (root)
4. Add environment variables under **Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL             = https://adqbrvbcyifrcmckkypg.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = sb_publishable_-QHX3KfAJ0sImPlL2QhL3A_y7TyU7iG
```

5. Deploy — every `git push` to `main` triggers a redeploy automatically.

---

## Supabase Storage

All Unity build files live in the **`secret-granny-game`** public bucket:

```
secret-granny-game/
├── GrannyBog.loader.js
├── GrannyBog.framework.js
├── GrannyBog.data.part01
├── GrannyBog.data.part02
│   ... (23 parts total)
├── GrannyBog.wasm.part01
├── GrannyBog.wasm.part02
└── StreamingAssets/
```

The browser fetches all `.part` files and stitches them in-memory before passing
blob URLs to the Unity loader — no server-side processing needed.

Make sure the bucket is set to **Public** in Supabase → Storage → Policies.

---

## File Structure

```
/
├── index.html        ← entry point + all game UI
├── _headers          ← Cloudflare Pages COOP/COEP headers (required for Wasm)
├── server.js         ← local dev only
├── .env.local        ← local secrets (never commit — add to .gitignore)
└── README.md
```

---

## .gitignore

Make sure this is in your `.gitignore`:

```
.env.local
Build/
```

The `Build/` folder only matters locally. In production, everything comes from Supabase.

---

*Granny™ is the property of DVloper. This port is for personal, non-commercial use only.*
