# Hazel Wedding Co. — website

Marketing site for Hazel Wedding Co., Madison Hasleton’s wedding planning and coordination
studio in Utah. Static HTML/CSS/JS, no build step, deploys to Vercel as-is.

## Pages

| URL | File | What it is |
| --- | --- | --- |
| `/` | `index.html` | Home: full-bleed hero, intro, three collections, why a planner, process, reviews, journal teaser |
| `/planning` | `planning.html` | Planning collections, month-of coordination, what’s included, process arc, à la carte, FAQ |
| `/journal` | `journal/index.html` | Blog index (filterable) |
| `/journal/<slug>` | `journal/*.html` | Blog posts (three included) |
| `/about` | `about.html` | Madison’s story, values |
| `/contact` | `contact.html` | Inquiry form + general FAQ |
| `/404` | `404.html` | Not-found page (Vercel picks it up automatically) |

Shared assets: `assets/css/styles.css`, `assets/js/main.js`, `assets/img/`. Photos in `media/`.

## Run it locally

```bash
python3 scripts/serve.py
```

Then open <http://localhost:8930>. The little server mimics Vercel’s clean URLs
(`/planning` → `planning.html`), so links behave exactly as they will in production.

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel: **Add New Project → Import** this repo. Framework preset: **Other**.
   No build command, no output directory. Deploy.
3. Add your domain under **Settings → Domains**.

`vercel.json` already turns on clean URLs, strips trailing slashes, and sets
long cache headers for `assets/` and `media/`.

## Before launch — the checklist

Everything below is marked in the HTML with `TODO`, `SLOT` or `PLACEHOLDER` comments;
`grep -rn "TODO\|PLACEHOLDER\|X,XXX\|XXX" *.html journal/` finds them all.

1. **Pricing.** Every price is a placeholder (`$XXX`, `$X,XXX`). They appear on
   `index.html` (three “From” lines), `planning.html` (three tiers, two coordination
   cards, the à la carte list) and nowhere else. Search for `X,XXX` and `XXX`.
2. **Photos.** Three slots still show a label until the `src` changes: Madison’s portrait
   (`about.html`), a candid of Madison (`index.html` intro) and a set-up shot
   (`index.html` “Why hire a planner”). The home hero uses the candle photo as a stand-in;
   swap for a wide still or a silent loop at `media/hero.mp4` (see `media/README.md`).
3. **Contact form.** Create a free form at [formspree.io](https://formspree.io), then set
   `data-endpoint="https://formspree.io/f/XXXX"` on the `<form>` in `contact.html`. Until
   then, submitting opens the visitor’s email app addressed to `data-mailto`. Update
   `data-mailto` and every `hello@hazelwedding.co` too.
4. **Story.** `about.html` has a stand-in first-person story marked `TODO`. Replace with
   the real one.
5. **Reviews.** The three quotes on the home page are labelled placeholders. Swap for real
   ones or delete the section.
6. **Domain.** `hazelwedding.co` is used in canonical/OG tags, `sitemap.xml`, `robots.txt`
   and the JSON-LD. Find-and-replace with the real domain. Add a 1200×630 `media/og.jpg`.
7. **Social links** in the footer.

## Design notes

Warm neutrals with a blush accent. Palette lives at the top of `styles.css`:
`--cream` page, `--paper` alternate sections, `--dark` for the dark bands, `--blush` for
fills and `--rose` for accent text (kept dark enough for 4.5:1 on cream). Type is Fraunces
(serif) and Figtree (sans) from Google Fonts.

## Adding a journal post

Copy `journal/golden-hour-timeline.html` to `journal/<new-slug>.html`, edit the `<title>`,
meta description, JSON-LD, heading, byline and body. Then add a card to `journal/index.html`
(and optionally to the teaser on `index.html`) and a line to `sitemap.xml`.

## How the motion works

All in `assets/js/main.js`, all opt-in via attributes, all disabled under
`prefers-reduced-motion`:

- `data-split` on a heading: words rise in one by one.
- `data-reveal` (fade/rise), `data-reveal="clip"` (image curtain), `data-stagger`
  on a parent to cascade its children.
- `data-parallax="0.1"` for gentle drift on scroll.
- `.count[data-to]` animates numbers.
- `.film[data-youtube]` click-to-load video slots (unused right now, kept for later).
- Page curtain on load and on internal navigation; header shrinks on scroll;
  in-page sub-nav highlights the current section.
