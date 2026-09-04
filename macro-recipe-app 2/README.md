# Macro Recipe Shopper

A small web app: paste a recipe link *or* get recipes suggested to match your
macro targets, select the ones you want, and it builds one consolidated
shopping list from them (merging duplicate ingredients across recipes).

It does **not** place the Deliveroo/Waitrose order automatically yet — see
"Ordering the ingredients" below for why, and the plan for adding it.

> **Don't double-click `index.html`.** This is a React app that talks to
> serverless functions for the Claude calls — opening the raw file in a
> browser (a `file://` link) can't run any of that, so it'll look blank or
> broken. You have to start it with `netlify dev` (see "Run it locally"
> below); that gives you a real `http://localhost:8888` URL to open instead.

## How it works

- **Paste a recipe link** → a Netlify serverless function fetches that page
  server-side and asks Claude to extract the ingredients and estimate the
  macros.
- **Browse by macros** → a second function asks Claude to suggest recipes
  that hit your calorie/protein/carb/fat targets.
- Both return recipes in the same shape, so the frontend treats them
  identically: you tick the ones you want, set "servings needed" if you
  want more or fewer than the recipe naturally makes, and the shopping
  list panel merges everything, scaled accordingly.

## Scaling servings

Each recipe card shows "Servings needed" (defaults to however many
servings the recipe/extraction says it makes). Change that number — say to
4 — and every ingredient quantity for that recipe is scaled by
`servings needed ÷ recipe's native servings` before it goes into the
shopping list. Two recipes both scaled up like this still merge into one
combined line per ingredient.

One caveat: if a recipe's native serving count couldn't be determined (a
page didn't state it, or Claude's suggestion left it out), it's treated as
1 serving — so double-check the "(recipe makes N)" note next to the input
before scaling, or the quantities will be off.

## Prerequisites

- [Node.js](https://nodejs.org) 18+ installed on your machine.
- A free [Netlify](https://netlify.com) account (you already have one from
  your meal planner app).
- An Anthropic API key (you already have one — same one your food logger's
  Apps Script proxy uses). Get/copy it from
  [console.anthropic.com](https://console.anthropic.com).

## Run it locally

```bash
npm install
npm install -g netlify-cli   # only needed once, ever
cp .env.example .env         # then paste your real key into .env
netlify dev
```

`netlify dev` runs the frontend *and* the serverless functions together on
`http://localhost:8888`, so both the "paste a link" and "browse by macros"
features work locally.

> If you just run `npm run dev` (plain Vite, no Netlify CLI), the page loads
> but both buttons will fail — that only serves the frontend, not the
> `/api/*` functions.

## Deploy it

1. Push this folder to a GitHub repo (same as you did for your meal planner).
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
   Build command `npm run build`, publish directory `dist` (already set in
   `netlify.toml`, so Netlify should pick these up automatically).
3. In **Site settings → Environment variables**, add `ANTHROPIC_API_KEY`
   with your key.
4. Deploy. That's it — no database, no other backend.

### Updating your live site after this

Your site is already deployed this way, from the `jen` GitHub repo. To push
a change: go to that repo on github.com, open the `macro-recipe-app 2`
folder, use **Add file → Upload files**, and drag the same folder back in —
GitHub treats files at matching paths as an update, not a duplicate. Commit,
and Netlify automatically rebuilds and redeploys within a minute or two,
since the site is connected to that repo.

## A couple of known rough edges (v1, on purpose)

- Ingredient merging doesn't do unit conversion — "200g chicken" and "0.5lb
  chicken" will show as two separate lines rather than one combined amount.
  Good enough for a shopping list; just eyeball it.
- Ingredient matching is fuzzy on purpose: it strips common descriptor words
  (skinless, boneless, fresh, organic, diced, low-fat, etc.) and naively
  singularizes ("tomatoes" → "tomato") before deciding two ingredient names
  are "the same" for merging. So "skinless chicken breast" and "chicken
  breast" merge into one shopping-list line, but it's a heuristic, not a
  real ingredient database — an unusual name or a typo can occasionally
  fail to match something it should (or, rarely, over-merge two things
  that aren't quite the same).
- Grocery categories (Fruits & Vegetables, Meat/Poultry & Fish, Dairy &
  Eggs, Bakery, Frozen, Pantry & Dry Goods, Herbs & Spices) are assigned
  by keyword matching on the ingredient name, checked in a fixed priority
  order (e.g. spice/pantry keywords are checked before produce keywords,
  so "avocado oil" lands in Pantry rather than Fruits & Vegetables).
  Anything that doesn't match a known keyword is filed under "Other." This
  will occasionally misfile an uncommon ingredient — just move it mentally
  when you're shopping.
- Macro estimates for browsed (non-linked) recipes are Claude's estimate,
  not lab-measured nutrition data — treat them as "close enough for weekly
  planning," not precise.
- Nothing is saved between visits — refreshing the page clears your recipe
  list. If that becomes annoying, the natural next step is to store selected
  recipes the same way your weight tracker stores data (Google Sheets /
  Apps Script), rather than adding a database.

## Ordering the ingredients (not automated yet — here's the plan)

Deliveroo doesn't publish an API for placing consumer orders, so there's no
clean "send this list, get a basket back" call to make. The realistic ways
to close this last gap, easiest first:

1. **Do it with Claude's browser automation, on demand.** Once your
   shopping list looks right, copy it and, in a Claude session with browser
   access, ask it to open Deliveroo UAE, find the Waitrose store, search and
   add each item to your basket — then **stop before checkout** so you
   review substitutions and pay yourself. This needs no extra setup on your
   side and is the natural next step to try first.
2. **A Playwright script you run locally**, if you end up doing this often
   enough to want one click instead of a conversation. It would read the
   shopping list (as JSON/text export from this app), drive a real Chrome
   window logged into your Deliveroo account, build the basket the same
   way, and still stop before payment. More setup, but repeatable without
   talking to Claude each time.

Either way, the checkout step should stay a manual click from you — product
matching on a live grocery site is never going to be 100% reliable, and
that's exactly the moment you want a human glancing at the basket before
paying.
