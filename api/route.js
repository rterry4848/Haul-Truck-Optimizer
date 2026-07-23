# Truck Count Optimizer — deployment guide

This turns the calculator into a real phone app: your foreman opens a link once,
adds it to his home screen, and from then on it opens full-screen with no browser
bar — like any other app. Live drive times come from TomTom, looked up by a small
serverless function so your API key never sits exposed in the app itself.

## If you already deployed and got the sw.js / raw-text bug

Earlier versions of this package put the frontend files inside a `public/`
folder. Vercel's zero-config static hosting (no framework detected) does
**not** treat `public/` as the web root by default — only certain frameworks
do that automatically. That mismatch caused the site to serve the wrong file.

Fix: in your GitHub repo, delete the `public/` folder and move `index.html`,
`manifest.json`, `sw.js`, `icon-192.png`, and `icon-512.png` up to sit
directly next to `api/` and `package.json` at the repo root — exactly like
this package is now structured. Commit and push; Vercel will auto-redeploy
and it'll resolve.

## What you need

- A TomTom API key (free tier is plenty for this use case)
- A free Vercel account (or Netlify — steps are nearly identical)
- 10–15 minutes

## Step 1 — Get a TomTom API key

1. Go to https://developer.tomtom.com and sign up (free)
2. Create a new app/project in their dashboard
3. Copy the API key it gives you — you'll paste it into Vercel in Step 3

## Step 2 — Deploy to Vercel

**Easiest path (no command line):**
1. Create a free GitHub account if you don't have one, and create a new repository
2. Upload this entire `paving-app` folder to that repository (drag-and-drop works on github.com)
3. Go to https://vercel.com, sign up with your GitHub account
4. Click "Add New Project," pick the repository you just created, click Deploy
   - Leave all settings as default — Vercel auto-detects the `/api` function and `/public` folder

**Command-line path (if you're comfortable with a terminal):**
```
npm install -g vercel
cd paving-app
vercel login
vercel --prod
```

## Step 3 — Add your TomTom key

1. In the Vercel dashboard, open your project
2. Go to Settings → Environment Variables
3. Add a variable named `TOMTOM_API_KEY` with the key from Step 1
4. Redeploy (Vercel prompts you, or just push any small change to the repo)

## Step 4 — Get it on the foreman's phone

1. Vercel gives you a URL like `https://your-project-name.vercel.app`
2. Send that link to your foreman (text, email, whatever)
3. He opens it in Safari (iPhone) or Chrome (Android)
4. **iPhone:** tap the Share icon → "Add to Home Screen"
   **Android:** tap the ⋮ menu → "Add to Home screen" / "Install app"
5. It now sits on his home screen as its own icon and opens full-screen, no browser bar

## Notes

- The API key never reaches the phone — the app calls your own `/api/route`
  function, which calls TomTom server-side. Safe to hand the link to anyone.
- If drive time lookups ever fail, the calculator itself still works fully —
  he can just type haul-out/haul-return minutes in by hand.
- Free tiers (Vercel + TomTom) comfortably cover a small crew using this a few
  times a shift. If usage grows a lot, check TomTom's pricing for overage.
- To update the app later (new default costs, tweaks, etc.), just edit the
  files and redeploy the same way — no need to resend a new link.
