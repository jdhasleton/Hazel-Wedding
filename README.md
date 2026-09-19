# Hazel Wedding Co. — website

**Version 2.3.1** · September 2026

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
| `/contact` | `contact.html` | Inquiry form (with consent notice + newsletter opt-in) + general FAQ |
| `/privacy` | `privacy.html` | Privacy Policy (Hazel Media LLC) |
| `/terms` | `terms.html` | Terms of Use |
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
2. **Photos.** Every image slot shows a label until its `src` changes. The home hero is
   currently the light “cream” state (`<section class="hero hero-center is-light">`): when a
   photo or silent loop goes in, remove `is-light` and add `on-dark` to the header so the
   wordmark turns cream over the photo (see the comment in `index.html`).
3. **Asset versions.** Stylesheet, script and SVG links carry `?v=2.3`. Bump the number in
   every HTML file whenever you change `styles.css` or `main.js`, or visitors may keep an
   older copy for up to an hour:
   ```bash
   sed -i '' 's/?v=2\.3\.1/?v=2.4/g' *.html journal/*.html
   ```
4. **Contact form.** Create a free form at [formspree.io](https://formspree.io), then set
   `data-endpoint="https://formspree.io/f/XXXX"` on the `<form>` in `contact.html`. Until
   then, submitting opens the visitor’s email app addressed to `data-mailto`. The newsletter
   checkbox posts as `newsletter=yes` alongside the inquiry.
5. **Newsletter.** The signup blocks on `index.html` and `journal/index.html` are
   `<form data-newsletter data-endpoint="">`. Point `data-endpoint` at a second Formspree form
   (or your email tool’s form endpoint). Until then the button opens a pre-addressed email.
6. **Google Analytics.** Paste the GA4 measurement ID into `GA_ID` at the top of §22 in
   `assets/js/main.js`. Analytics loads only after a visitor accepts cookies; the choice is
   stored in `localStorage` under `hazel-consent`. Any element with `data-cookie-settings`
   reopens the preferences (there is one on the Privacy page).
7. **Story.** `about.html` has a stand-in first-person story marked `TODO`. Replace with
   the real one.
8. **Reviews.** The three quotes on the home page are labelled placeholders. Swap for real
   ones or delete the section.
9. **Domain.** `hazelwedding.com` and `planning@hazelwedding.com` are used throughout (they
   match the legal pages). Add a 1200×630 `media/og.jpg` for link previews.
10. **Social links** in the footer.
11. **Legal.** `privacy.html` and `terms.html` carry an effective date of September 18, 2026.
    Update the date in both files whenever the text changes.

## Design notes

Warm neutrals with a blush accent. Palette lives at the top of `styles.css`:
`--cream` page, `--paper` alternate sections, `--dark` for the dark bands, `--blush` for
fills and `--rose` for accent text (kept dark enough for 4.5:1 on cream). Type is Fraunces
(serif) and Figtree (sans) from Google Fonts.

## Versions

| Tag | What changed |
| --- | --- |
| `v1.0` | Original two-person planning + photo/film site |
| `v2.0` | Planning-only redesign for Madison: warm neutrals + blush, placeholder pricing, portfolio and photo/film pages removed |
| `v2.1` | Blush hover states, all photos swapped for placeholder slots, capped image heights, JS additions (validation, header tuck, accordion, back-to-top) |
| `v2.2` | Privacy Policy + Terms of Use pages, Hazel Media LLC footer, inquiry consent notice + newsletter opt-in, standalone newsletter signup, cookie banner with Google Analytics consent gate, domain → hazelwedding.com |
| `v2.3` | Cream hero with centred “Hazel Wedding” wordmark, cream/hazel favicon, asset URLs version-stamped (`?v=`) and the year-long `assets/` cache header relaxed so stylesheet changes actually reach visitors |
| `v2.3.1` | Hero wordmark no longer clips the italic l and g |

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
- Page curtain on load and on internal navigation; header shrinks on scroll and tucks away
  on scroll-down; in-page sub-nav highlights the current section.
- Inline form validation, animated FAQ accordion, magnetic buttons, back-to-top.
- Cookie banner (§22) gates Google Analytics on consent; newsletter forms (§21).
