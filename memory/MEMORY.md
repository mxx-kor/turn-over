# Turn-Over Project Memory

## Stack
- Next.js 16 + React 19 + TypeScript
- Electron 40 (main: `electron-dist/main.js`, source: `electron/`)
- Supabase (`@supabase/ssr`) for auth — Google OAuth
- Tailwind CSS v4 + shadcn/ui
- Zustand for state

## Key Architecture
- Electron wraps a Next.js server running on `http://localhost:3000`
- Main window uses `partition: 'persist:main'` for an isolated session
- Popup window (`/popup`) opened via global shortcut `Alt+Shift+A` for flashcard creation
- App lives in the macOS menu bar (dock hidden by default)

## Electron Build
- TypeScript source: `electron/main.ts`, `electron/preload.ts`
- Compiled output: `electron-dist/` (via `npm run electron:compile`)
- **Always run `electron:compile` before launching** — `electron:dev` now does this automatically
- Changing `electron/preload.ts` or `electron/main.ts` requires recompile; forgetting this causes "X is not a function" errors at runtime

## Auth Flow (Electron)
- Google OAuth opens in the **system browser** (not inside Electron) because native passkey/Touch ID dialogs cannot surface inside Electron's Chromium renderer
- Flow: login button → `skipBrowserRedirect: true` → `shell.openExternal(url)` → browser authenticates → `/auth/callback?via=electron` → redirects browser to `turnover://auth?code=...` → Electron catches deep link (`open-url` on macOS, `second-instance` on Windows) → loads callback URL in main window → PKCE exchange completes → `/dashboard`
- Custom protocol `turnover://` registered via `app.setAsDefaultProtocolClient`
- Supabase redirect URL `http://localhost:3000/auth/callback` must be whitelisted in Supabase dashboard (query params ignored by URL matching)

## Known Issues / Fixes
- Passkeys (Touch ID, iCloud Keychain, Windows Hello) do NOT work inside the Electron window — must use external browser
- `window.electron` types defined in `src/types/electron.d.ts`
