# Hazel Wedding Co. — website

Marketing site for Hazel Wedding Co., a husband-and-wife studio offering wedding
planning, photography and film. Static HTML/CSS/JS, no build step, deploys to
Vercel as-is.

## Pages

| URL | File | What it is |
| --- | --- | --- |
| `/` | `index.html` | Home: hero (video slot), intro, three services, featured film, why one team, selected work, process, reviews, journal teaser |
| `/planning` | `planning.html` | Planning collections + pricing, month-of coordination, process arc, à la carte, FAQ |
| `/photo-video` | `photo-video.html` | Photography tiers, film tiers, photo + film bundles, sessions, à la carte, film slots, FAQ |
| `/portfolio` | `portfolio.html` | Real-wedding stories, filterable gallery with lightbox, film slots |
| `/journal` | `journal/index.html` | Blog index (filterable) |
| `/journal/<slug>` | `journal/*.html` | Blog posts (three included) |
| `/about` | `about.html` | Your story, the two of you, values |
| `/contact` | `contact.html` | Inquiry form + general FAQ |
| `/404` | `404.html` | Not-found page (Vercel picks it up automatically) |

Shared assets: `assets/css/styles.css`, `assets/js/main.js`, `assets/img/`.

## Run it locally

```bash
python3 scripts/serve.py
```

Then open <http://localhost:8930>. The little server mimics Vercel's clean URLs
(`/planning` → `planning.html`), so links behave exactly as they will in
production.

## Deploy to Vercel

1. Push this repo to GitHub (already done if you're reading this there).
2. In Vercel: **Add New Project → Import** this repo. Framework preset: **Other**.
   No build command, no output directory. Deploy.
3. Add your domain under **Settings → Domains**.

`vercel.json` already turns on clean URLs, strips trailing slashes, and sets
long cache headers for `assets/` and `media/`.

## Before launch — the checklist

Everything below is marked in the HTML with `TODO`, `SLOT`, `FILM SLOT` or
`PLACEHOLDER` comments; `grep -rn "TODO\|PLACEHOLDER" *.html journal/` finds them all.

1. **Photos.** Every image is currently `assets/img/placeholder.svg` with a label
   describing what belongs there (the label comes from the `alt` text and hides
   itself as soon as the `src` no longer says `placeholder`). Drop your files in
   `media/` and change the `src`. Keep `alt` text meaningful. See `media/README.md`
   for suggested sizes.
2. **Films.** Every video slot looks like:
   ```html
   <div class="film" data-youtube="" data-poster="" data-title="…" data-sub="…"></div>
   ```
   Paste the YouTube ID (the part after `v=`) into `data-youtube`. Or use
   `data-vimeo="123456"`, or `data-src="media/film.mp4"` for a self-hosted file.
   Add a `data-poster` image for a custom thumbnail (YouTube's is used otherwise).
   Empty slots render a tasteful "film slot" frame so nothing looks broken.
3. **Hero video.** Put a short silent loop at `media/hero.mp4`, then uncomment the
   `<source>` line inside the hero `<video>` in `index.html` and set the poster
   `<img>` to a real still.
4. **Contact form.** Create a free form at [formspree.io](https://formspree.io),
   then set `data-endpoint="https://formspree.io/f/XXXX"` on the `<form>` in
   `contact.html`. Until then, submitting opens the visitor's email app addressed
   to `data-mailto`. Update `data-mailto` and every `hello@hazelwedding.co` too.
5. **Names + story.** `about.html` has `[Her name]` and a story written as a
   stand-in. Replace with the real one.
6. **Reviews.** The three quotes on the home page and the pull-quote in
   Selected Work are labelled placeholders. Swap for real ones or delete the section.
7. **Domain.** `hazelwedding.co` is used in canonical/OG tags, `sitemap.xml`,
   `robots.txt` and the JSON-LD. Find-and-replace with your real domain. Add a
   1200×630 `media/og.jpg` for link previews.
8. **Social links** in the footer.
9. **Prices.** Set for a Utah studio at national mid-market rates (see below).
   Edit freely; the JSON-LD `offers` in each page's `<head>` should match.

## Pricing summary (as shipped)

Planning: Blueprint $950 · Partial + day-of $3,600 · Full service from $6,800 ·
Month-of coordination $1,750 · Small Day (≤30 guests) $1,200.

Photography: Essential $2,400 (6h, 1 photographer) · Signature $3,600 (8h, 2
photographers, engagement) · Heirloom $5,200 (10h, 2 photographers, engagement +
bridal, album).

Film: Highlight $2,200 · Feature $3,400 (2 cinematographers, ceremony + toasts,
drone) · Legacy $5,400 (love-story + bridal films, documentary edit, raw).

Bundles: The Day $4,150 · The Story $6,300 · The Whole Story $9,500 · any
planning collection + a bundle takes a further $500 off.

## Adding a journal post

Copy `journal/golden-hour-timeline.html` to `journal/<new-slug>.html`, edit the
`<title>`, meta description, JSON-LD, heading, byline and body. Then add a card
to `journal/index.html` (and optionally to the teaser on `index.html`) and a
line to `sitemap.xml`.

## How the motion works

All in `assets/js/main.js`, all opt-in via attributes, all disabled under
`prefers-reduced-motion`:

- `data-split` on a heading: words rise in one by one.
- `data-reveal` (fade/rise), `data-reveal="clip"` (image curtain), `data-stagger`
  on a parent to cascade its children.
- `data-parallax="0.1"` for gentle drift on scroll.
- `.count[data-to]` animates numbers.
- Page curtain on load and on internal navigation; header shrinks on scroll;
  in-page sub-nav highlights the current section.
