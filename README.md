# First Housekeeping (第一家政)

Bilingual marketing site for First Housekeeping — air duct, dryer vent, and carpet cleaning serving metro Atlanta.

**Live site:** https://firsthousekeeping.com (after Cloudflare Pages deploy)

---

## Tech Stack

- **Vite + React + TypeScript**
- **Tailwind CSS 3** — styling
- **react-router-dom** — client-side routing
- **lucide-react** — icons
- **Custom i18n** — English (default) + Chinese (中文), persists in localStorage
- **Supabase** — chat backend (DB + realtime + auth)
- **Anthropic Claude** — auto-translation between English ↔ Chinese for chat

## Local Development

```bash
npm install        # one time
npm run dev        # start dev server (http://localhost:5173)
npm run build      # production build → ./dist
npm run preview    # preview production build locally
```

## Project Structure

```
src/
├── components/
│   ├── Header.tsx          # nav + language toggle + mobile menu
│   ├── Footer.tsx          # site footer
│   ├── ChatWidget.tsx      # floating chat bubble (Supabase + AI translation)
│   └── ScrollToTop.tsx     # scrolls to top on route change
├── i18n/
│   ├── translations.ts     # ALL site copy (EN + ZH) — edit here to change text
│   └── LanguageContext.tsx # React context for active language
├── lib/
│   ├── utils.ts            # cn() helper for Tailwind
│   ├── zipDistances.ts     # ZIP code → distance lookup table (edit to add/correct ZIPs)
│   ├── supabase.ts         # Supabase client (returns null if env vars missing)
│   └── chat.ts             # chat helpers (RPC + admin queries + polling)
├── pages/
│   ├── Home.tsx
│   ├── ServicePage.tsx     # shared layout for all 3 service pages
│   ├── ServiceArea.tsx     # includes the travel-fee calculator
│   ├── Quote.tsx           # request-a-quote form
│   ├── Contact.tsx         # contact info + WeChat QR section
│   ├── Admin.tsx           # mom's chat dashboard at /admin (Chinese UI)
│   └── NotFound.tsx
├── App.tsx                 # router setup
├── main.tsx                # entry point
└── index.css               # Tailwind directives + base styles

supabase/
├── schema.sql              # DB tables + RPC functions + RLS — run once in SQL editor
└── functions/translate/
    └── index.ts            # Edge Function that calls Anthropic API
```

## Common edits

### Change site copy (English or Chinese)
Edit `src/i18n/translations.ts`. Every string lives there.

### Update phone number / email / address
Edit the `brand` object in `src/i18n/translations.ts` (both `en` and `zh` blocks).

### Add or correct a ZIP code distance
Edit `src/lib/zipDistances.ts`. Format: `'30097': { city: 'Duluth / Johns Creek', miles: 4 }`.

### Change the free-radius rule or per-mile fee
Edit the constants at the top of `src/lib/zipDistances.ts`:
```ts
export const FREE_RADIUS_MILES = 20;
export const PER_MILE_FEE = 2;
```

### Wire the quote form to a real backend
The form in `src/pages/Quote.tsx` currently logs to console and simulates success.
Replace the body of `handleSubmit` with a `fetch()` to your endpoint of choice:
- **[Web3Forms](https://web3forms.com)** (free, no account needed)
- **[Formspree](https://formspree.io)** (free tier, easy)
- **Cloudflare Worker + email** (most flexible)

## Deploy to Cloudflare Pages

The domain `firsthousekeeping.com` is already registered in Cloudflare.

### One-time setup

1. **Push this repo to GitHub** (see below).
2. In Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Pick this repo. Cloudflare will auto-detect Vite. Confirm:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Click **Save and Deploy**. First build takes ~2 minutes.
5. Once live (e.g. `first-housekeeping.pages.dev`):
   - Go to **Custom domains** → add `firsthousekeeping.com` and `www.firsthousekeeping.com`.
   - Cloudflare auto-creates the DNS records (because the domain is in CF already).

### Every subsequent deploy

Just push to `main`:
```bash
git add .
git commit -m "Update pricing copy"
git push
```
Cloudflare auto-builds and deploys in ~30s–2min. Pull-request branches get preview URLs automatically.

## Push to GitHub (first time)

```bash
# In this folder:
git branch -M main
git remote add origin https://github.com/<your-user>/first-housekeeping.git
git push -u origin main
```
(Create the empty repo on github.com first — no README, no .gitignore, keep it empty.)

## Chat setup (one-time, ~15 minutes)

The chat lets customers message the business in English; the owner reads and replies in Chinese (auto-translated both ways).

### What you'll create
1. A Supabase project (free) — stores conversations + messages.
2. An Anthropic API key — does the translation (~$0.0005 per message).
3. An admin login for the owner (mom) — used to access `/admin`.

### Step 1 — Supabase project (3 min)

1. Go to https://supabase.com → sign up / log in → **New Project**.
2. Name: `first-housekeeping`. Region: pick the one nearest Atlanta (e.g. *East US (N. Virginia)*).
3. Set a strong DB password (save it). Click **Create**.
4. Wait ~2 min for provisioning. Once ready, open **Project Settings → API** and copy:
   - **Project URL** → goes into `VITE_SUPABASE_URL`
   - **anon public key** → goes into `VITE_SUPABASE_ANON_KEY`

### Step 2 — Run the schema (1 min)

1. In your Supabase dashboard, open **SQL Editor → New query**.
2. Open `supabase/schema.sql` in this repo, copy the entire file, paste into the SQL editor.
3. Click **Run**. You should see `Success. No rows returned`.

### Step 3 — Create the owner login (1 min)

1. In Supabase → **Authentication → Users → Add user → Create new user**.
2. Enter mom's email + a password she can remember.
3. **Important:** check **Auto-confirm user** so she doesn't need to verify the email.

### Step 4 — Anthropic API key (3 min)

1. Go to https://console.anthropic.com → sign up.
2. Add a payment method (~$5 minimum prepayment is plenty — translation costs are tiny).
3. Go to **API Keys → Create Key**. Copy it (starts with `sk-ant-`).

### Step 5 — Deploy the translation Edge Function (3 min)

You need the Supabase CLI. Install once:

```bash
npm install -g supabase
```

Then from this project's root:

```bash
# Log in
supabase login

# Link this folder to your Supabase project (replace YOUR_REF)
# Find YOUR_REF in: Supabase dashboard URL is https://supabase.com/dashboard/project/YOUR_REF
supabase link --project-ref YOUR_REF

# Set the Anthropic key as a secret (only the function can read it)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE

# Deploy the function
supabase functions deploy translate --no-verify-jwt
```

Verify it's live by visiting `https://YOUR_REF.supabase.co/functions/v1/translate` — you should get a 405 ("Method not allowed") which means the endpoint exists and only accepts POST. ✅

### Step 6 — Local env file (1 min)

Copy the example, then fill in your real values:

```bash
cp .env.example .env.local
```

Open `.env.local` and paste:
```
VITE_SUPABASE_URL=https://YOUR_REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi... (the anon key you copied)
VITE_TRANSLATE_URL=https://YOUR_REF.supabase.co/functions/v1/translate
```

Restart the dev server (`npm run dev`).

### Step 7 — Add the same env vars to Cloudflare Pages

In Cloudflare → **your Pages project → Settings → Environment variables**, add the same three `VITE_*` vars to **Production** AND **Preview** environments.

Push to GitHub → Cloudflare auto-deploys with chat enabled.

### How to verify it works

1. Open the site → click the green chat bubble bottom-right
2. Type "Hi, I need air duct cleaning" → Send
3. Open `/admin` in another tab → log in with mom's credentials
4. You should see the conversation appear with the message **translated to Chinese** within a few seconds
5. Reply in Chinese from `/admin` → switch back to the customer tab → it appears **in English**

## WeChat QR code

To enable the WeChat section on `/contact`:

1. Save your WeChat QR code as a PNG (300×300 px or larger).
2. Drop it into `public/wechat-qr.png` (exact filename).
3. Edit `src/i18n/translations.ts` → `wechat.idValue` to your WeChat ID (in both `en` and `zh` blocks).
4. Push — it auto-appears on Contact.

If `public/wechat-qr.png` doesn't exist, the section gracefully shows a "coming soon" placeholder.

## Admin page (`/admin`)

Mom logs in here to read customer messages and reply.
- All messages from English customers appear in Chinese (auto-translated).
- Mom types replies in Chinese; the customer sees them in English.
- Realtime updates — no need to refresh.
- Mobile-friendly: list of conversations → tap to open → reply.

URL: `https://firsthousekeeping.com/admin`
Login: the email + password created in Supabase Auth (Step 3).

**Security note**: the admin URL isn't hidden — it relies on Supabase Auth. Use a strong password.

## To-do before launch

- [ ] Replace placeholder phone `(770) 555-0123` in `src/i18n/translations.ts` (both EN and ZH `brand.phone`)
- [ ] Replace placeholder email `info@firsthousekeeping.com` if needed
- [ ] Add real photos (hero image, before/after gallery)
- [ ] Wire quote form to a real submission endpoint
- [ ] Add Google Business Profile + Google Analytics
- [ ] Add favicon & social sharing image (`og:image`)
- [ ] Verify ZIP distance table — adjust any miles that are off
- [ ] Add SEO meta tags per page (consider `react-helmet-async`)
