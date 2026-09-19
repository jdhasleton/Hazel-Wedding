# media/

Put your own photos and films here. Suggested layout:

```
media/
  hero.mp4              short silent loop for the home hero (1920×1080, ≤ 8 MB, no audio)
  hero.jpg              poster shown before the video plays / on mobile
  home/                 images used on the home page
  planning/
  photo-video/
  portfolio/            gallery images (≈1600px wide) + *-full.jpg (≈2400px) for the lightbox
  about/
  journal/
```

Then point the `src` attributes in the HTML at these files, e.g.
`src="media/portfolio/summit-01.jpg"`.

Video files (`*.mp4`, `*.mov`) larger than ~50 MB should not go in git.
Host them on YouTube/Vimeo and use the `data-youtube` / `data-vimeo` slots instead.
