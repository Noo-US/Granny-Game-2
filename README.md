```
  ██████  ██████   █████  ███    ██ ███    ██ ██    ██
 ██       ██   ██ ██   ██ ████   ██ ████   ██  ██  ██
 ██   ███ ██████  ███████ ██ ██  ██ ██ ██  ██   ████
 ██    ██ ██   ██ ██   ██ ██  ██ ██ ██  ██ ██    ██
  ██████  ██   ██ ██   ██ ██   ████ ██   ████    ██
```

> *Don't make any noise. She'll hear you.*

WebGL browser port of **Granny** by [DVloper](https://www.dvloper.com).
Port by **Ducky** — hosted on Vercel, assets served from the repo.

---

## Stack

| Layer | Service |
|---|---|
| Hosting | Vercel |
| Asset storage | Repo (`/Build` folder) |
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

## File Structure

```
/
├── index.html            ← entry point + all game UI
├── vercel.json           ← COOP/COEP headers required for Wasm
├── ServiceWorker.js
├── manifest.webmanifest
├── server.js             ← local dev only
├── README.md
└── Build/
    ├── GrannyBog.loader.js
    ├── GrannyBog.framework.js
    ├── GrannyBog.data.part01
    ├── GrannyBog.data.part02
    │   ... (23 parts total)
    ├── GrannyBog.wasm.part01
    ├── GrannyBog.wasm.part02
    └── StreamingAssets/
```

> **Note:** Vercel's free tier has a **250 MB total deployment size limit**.  
> If your `Build/` folder exceeds this, consider upgrading to a paid plan or
> splitting off only the largest part files to Git LFS.

---

## Local Development

Requires [Node.js](https://nodejs.org) — no install step, no dependencies.

```bash
git clone <your-repo>
cd Granny-main
node server.js
```

Open **http://localhost:3000** — or the Network address printed in the terminal to
access from another device (e.g. a Chromebook on the same WiFi).

> `server.js` auto-combines any `.part01/.part02` split files on first run,
> sets the required COOP/COEP headers, and serves correct MIME types for `.wasm`.

---

## Deploying to Vercel

1. Make sure `Build/` is **committed to the repo** (remove it from `.gitignore` if needed)
2. Push the repo to GitHub
3. Go to [Vercel](https://vercel.com) → **Add New Project** → import your repo
4. Build settings: leave **Framework Preset** as *Other*, **build command** blank,
   **output directory** blank (serves from root)
5. Click **Deploy** — every `git push` to `main` redeploys automatically

No environment variables are needed.

---

## .gitignore

```
.env.local
```

The `Build/` folder must be committed so Vercel can serve the game files.

---

*Granny™ is the property of DVloper. This port is for personal, non-commercial use only.*
