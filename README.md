# Emergent Studio

A self-hosted, open-source take on the [app.emergent.sh](https://app.emergent.sh) workflow — with one rule: the apps it generates actually run.

Describe an app in plain language. The studio derives a data model, writes a self-contained HTML/CSS/JS app, serves it in a live preview, keeps a real version history, and publishes it at a working URL.

**Free forever:** no accounts, no credits, no paid tiers. Builds, chat edits, publishing and ZIP export are unlimited on your own server.

---

## What is real

| Step | What actually happens |
| --- | --- |
| **Plan** | `frontend/src/lib/studio/analyze.ts` parses the prompt: entity name, typed fields (text, number, date, time, choice, yes/no, long text), theme mode and accent. Nothing comes from a preset app library. |
| **Build** | `generate.ts` writes `index.html`, `styles.css`, `app.js`, `schema.json` and `README.md`. The app has create/edit/delete, search, filters, sorting, stat counters, CSV export and `localStorage` persistence. |
| **Preview** | The iframe loads the generated files from `/api/jobs/<id>/preview/...` with real content types, so the preview *is* the app — not a screenshot. |
| **Iterate** | Chat instructions really edit the blueprint and rebuild it as a new version (`v2`, `v3`, …). See [supported edits](#what-you-can-ask-for). |
| **Roll back** | Any earlier version can be restored and edited again. |
| **Publish** | Publishing serves the chosen version at `/p/<slug>`; re-publishing pushes the current version. |
| **Export** | Any build downloads as a ZIP (`index.html`, `styles.css`, `app.js`, `schema.json`, `README.md`) that runs on any static host. |
| **Free** | No credits, quotas or paywalls — every build, edit, publish and export is unlimited. |

Jobs, versions and messages are stored in `frontend/.data/studio.json`. No accounts, no database, no external services. If that file is unreadable, the studio moves it aside as `studio.json.corrupt-<timestamp>.bak` and starts from an empty workspace instead of failing every request.

## What it is not

Read this before expecting an LLM product:

- **No AI model is called.** Prompt understanding is deterministic and rule-based. It recognises explicit attributes (`name`, `email`, `price`, `due date`, `status`, `notes`, …) and derives the rest. It will not invent domain-specific screens.
- **Generated apps are single-page and client-side.** Their records live in the visitor's `localStorage`, so two devices do not share data, and there is no generated server API.
- **Chat edits follow a known grammar** — unsupported instructions get an honest "I did not catch that" reply rather than a fake success.
- **Single workspace.** There is no login; anyone who can reach the server shares it. The JSON store is meant for one server process, not serverless or multi-replica hosting.
- **`backend/` is legacy.** The FastAPI/MongoDB service and the Telegram/WhatsApp agent from an earlier iteration are not used by this studio. The Capacitor wrapper in `frontend/android` targeted the old static export and is not maintained; use the browser instead.

## Requirements

- Node.js 22.x and npm. `frontend/.nvmrc` pins the version, so run `nvm use` there; CI reads the same file. Other versions still install, but npm warns with `EBADENGINE`.

## Run locally

```bash
cd frontend
npm ci
npm run dev -- -H 0.0.0.0 -p 3000
```

Open <http://localhost:3000>. The production build is:

```bash
cd frontend
npm run build
npm run start
```

Reset the workspace by deleting `frontend/.data/studio.json` (jobs, versions and messages).

## From a phone (Android or iOS)

1. Run the server bound to all interfaces: `npm run dev -- -H 0.0.0.0 -p 3000`.
2. On the phone, open `http://<computer-LAN-IP>:3000` (same Wi-Fi).
3. For access from anywhere, put the app behind any HTTPS reverse proxy or tunnel and open that URL.

The builder is designed for small screens: below 1024 px it switches to an **App / Chat** toggle instead of squeezing both panes side by side, the tab bar collapses to icons, and the preview uses the full remaining height. Published URLs (`/p/<slug>`) work in the same mobile browser.

On Android Chrome the viewport uses `interactive-widget=resizes-content`, so opening the keyboard shrinks the layout instead of covering the chat composer.

The studio ships a web app manifest (`/manifest.webmanifest`, `display: standalone`, 192/512 px icons plus a maskable icon), so **Chrome → menu → Add to Home screen** installs it like an app. On iOS use Share → Add to Home Screen.

When Chrome reports the page as installable, the home page shows an **Install** banner driven by `beforeinstallprompt`; it disappears once the app is installed or the visitor dismisses it. iOS Safari gets a short *Share → Add to Home Screen* hint instead. The PNG icons are rasterized from `frontend/public/icons/icon.svg`, which is kept as the editable source.

Note that a generated app keeps its records in the browser that opened it, independently on each device.

## Configuration

No secrets or API keys are required. See [`.env.example`](.env.example). The only optional variable is `PORT` (default `3000`).

## What you can ask for

| Instruction | Effect |
| --- | --- |
| `add a price field` | Adds a typed field (number with currency unit). |
| `remove the notes field` | Removes a field (the app always keeps one). |
| `rename the title field to Name` | Renames a field, keeping its data key. |
| `make the price field a number` | Changes the field type. |
| `rename the app to Garden Log` | Renames the project and the generated app. |
| `make it light mode` / `make it dark mode` | Switches the theme. |
| `use a teal accent` / `#ff8800` | Changes the accent colour. |
| `remove the CSV export` / `add search` | Toggles search, filter, sort, stats or CSV export. |

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/stats` | Workspace counters (builds, versions, published). |
| `GET` | `/api/jobs` | List builds (summary). |
| `POST` | `/api/jobs` | Create a build: `{ "prompt": "...", "appType": "fullstack" \| "mobile" \| "landing" }`. |
| `GET` | `/api/jobs/<id>` | Full build with versions, messages and files. |
| `DELETE` | `/api/jobs/<id>` | Delete a build. |
| `POST` | `/api/jobs/<id>/messages` | Apply a chat edit: `{ "content": "add a due date field" }`. |
| `POST` | `/api/jobs/<id>/rollback` | Restore a version: `{ "version": 2 }`. |
| `POST` | `/api/jobs/<id>/publish` | Publish the current version. |
| `GET` | `/api/jobs/<id>/export?version=<n>` | Download a version as a ZIP archive (no parameter = current version). |
| `GET` | `/api/jobs/<id>/preview/<file>` | Serve the current version's files. |
| `GET` | `/p/<slug>` | Serve a published build. |

## Project layout

```
frontend/
  src/app/                     landing page, builder, API routes, /p/<slug> publisher
  src/lib/studio/
    analyze.ts                 prompt → blueprint (entity, fields, theme)
    generate.ts                blueprint → working HTML/CSS/JS
    iterate.ts                 chat instruction → blueprint change
    pipeline.ts                build + bundle validation (files, asset links, JS syntax, schema) + agent events
    store.ts                   JSON persistence and version helpers
    runtime/                   browser runtime shipped inside generated apps
  test/validation.test.ts      node:test suite for generated bundles and validation
  .data/studio.json            created on first build (git-ignored)
backend/                       legacy FastAPI service (unused)
```

## Checks

```bash
cd frontend
npm test          # node:test: generated bundles + validation rejections
npx tsc --noEmit
npm run build
```

GitHub Actions runs `npm ci`, `npm test` and `npm run build` in `frontend/` on every push and pull request (`.github/workflows/ci.yml`).

## License

See [LICENSE.txt](LICENSE.txt).
