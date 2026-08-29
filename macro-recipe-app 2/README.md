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
  identically: you tick the ones you want, adjust "servings to make" if
  you're batch cooking, and the shopping list panel merges everything.

## Two people, two macro targets

There's a "Adding recipes for: Jennifer / Dino" toggle above the recipe
forms. Whichever name is selected when you paste a link or generate
suggestions, that's who the recipe gets tagged to (you can also reassign an
individual recipe afterwards from the "For:" dropdown on its card).

Recipes are grouped on screen by person, and the shopping list panel has
three tabs: **Jennifer**, **Dino**, and **Combined** — the first two are
each person's own list (built only from their selected recipes), and
Combined merges both, the same way you'd want it when you're actually
shopping together.


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

## A couple of known rough edges (v1, on purpose)

- Ingredient merging doesn't do unit conversion — "200g chicken" and "0.5lb
  chicken" will show as two separate lines rather than one combined amount.
  Good enough for a shopping list; just eyeball it.
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
