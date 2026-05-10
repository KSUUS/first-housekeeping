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
│   └── ScrollToTop.tsx     # scrolls to top on route change
├── i18n/
│   ├── translations.ts     # ALL site copy (EN + ZH) — edit here to change text
│   └── LanguageContext.tsx # React context for active language
├── lib/
│   ├── utils.ts            # cn() helper for Tailwind
│   └── zipDistances.ts     # ZIP code → distance lookup table (edit to add/correct ZIPs)
├── pages/
│   ├── Home.tsx
│   ├── ServicePage.tsx     # shared layout for all 3 service pages
│   ├── ServiceArea.tsx     # includes the travel-fee calculator
│   ├── Quote.tsx           # request-a-quote form
│   ├── Contact.tsx
│   └── NotFound.tsx
├── App.tsx                 # router setup
├── main.tsx                # entry point
└── index.css               # Tailwind directives + base styles
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

## To-do before launch

- [ ] Replace placeholder phone `(770) 555-0123` in `src/i18n/translations.ts` (both EN and ZH `brand.phone`)
- [ ] Replace placeholder email `info@firsthousekeeping.com` if needed
- [ ] Add real photos (hero image, before/after gallery)
- [ ] Wire quote form to a real submission endpoint
- [ ] Add Google Business Profile + Google Analytics
- [ ] Add favicon & social sharing image (`og:image`)
- [ ] Verify ZIP distance table — adjust any miles that are off
- [ ] Add SEO meta tags per page (consider `react-helmet-async`)
