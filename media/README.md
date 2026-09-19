# media/

Photos go here. Every image slot on the site currently points at
`assets/img/placeholder.svg` and shows its label (from the frame's `data-slot`) until the
`src` changes. `grep -rn "data-slot" *.html journal/` lists every slot with its intended subject.

Suggested layout:

```
media/
  hero.jpg              home hero still (≥ 2400px wide) — or hero.mp4, see index.html
  home/                 intro portrait, three collection cards, "why a planner" set-up shot, CTA
  planning/             collage + "included" image
  about/                wide image, Madison's portrait
  journal/              one wide image per post (≈ 2400 × 1030)
  og.jpg                1200 × 630 for link previews
```

Keep in-page images around 1600px wide; the wide 21:9 frames want ≈ 2400px. Video files
larger than ~50 MB should not go in git; host them on YouTube/Vimeo and use the
`data-youtube` / `data-vimeo` slots instead.

The six stills used in the September 2026 preview are still in git history (commit `35d1e82`)
if you want them back.
