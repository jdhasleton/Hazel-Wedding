# media/

Photos live here. Current layout:

```
media/
  home/
    candlelit-stairway.webp     home hero (stand-in), planning collage, CTA background
    bouquet-blue-ribbon.webp    Full-Service card, journal, planning CTA
    basket-of-blooms.webp       Partial Planning card, planning "included" section
    temple-spire.webp           Month-of card, about hero, journal
  planning/
    temple-inscription.webp     planning collage
  about/
    bouquets-and-baskets.webp   home intro, contact aside
```

Still needed (each slot shows its label on the page until the `src` changes):

- A portrait of Madison — `about.html` (4:5)
- A candid of Madison at work — `index.html` intro (4:5)
- A ceremony or reception set-up you designed — `index.html` "Why hire a planner" (4:5)
- A proper hero: either a wide still (≥ 2400px) or a short silent loop at `media/hero.mp4`
  (1920×1080, ≤ 8 MB, no audio) — see the comment in `index.html`
- `og.jpg` at 1200×630 for link previews

Keep gallery images around 1600px wide. Video files larger than ~50 MB should not go in
git; host them on YouTube/Vimeo and use the `data-youtube` / `data-vimeo` slots instead.
