# Why Math? — Visual Asset Policy

## Design principle

Math education is not a developer-diagram gallery. Visual clarity, illustration quality, and learner engagement matter. **Avoid using SVG as the default authored illustration format.** Do not lower visual quality to avoid producing image assets.

## Rendering choices

1. **Large, illustrated scenes and diagrams:** design as production-quality PNG/WebP artwork at suitable resolution (normally @2x for the display size). Keep math labels and controls as accessible HTML overlays when possible, so text is crisp and localizable.
2. **Small, reusable visual elements:** use independently produced **transparent PNG/WebP** sprites. Compose them over a PNG background with CSS positioning or render to a canvas, allowing animation or user manipulation without rasterizing the entire UI.
3. **Short explanatory motion sequences:** use GIF or another supported animation format for deliberate explanatory animation, ideally with play/pause controls and static fallback. Respect `prefers-reduced-motion` and keep loops understandable.
4. **Genuinely interactive mathematical visualizations:** use semantic HTML/CSS or Canvas for the live computation, manipulation, hit targets and plotting. A CSS number line with mathematically accurate ticks is acceptable as a functional control; it must not become a generic SVG-heavy decorative illustration. For complex drawing, compose raster assets and render overlays using Canvas.
5. **SVG exception:** small interface icons and cases where resolution-independent vector geometry is itself necessary; do not use programmatic SVG merely as a low-effort replacement for designed teaching artwork.

## Quality and correctness requirements

- Mathematical correctness has priority over illustration. Do not embed generated mathematics, numbers, or formulas into a raster image unless reviewed; prefer HTML/MathJax/KaTeX overlays for text and formulas.
- Keep visual composition responsive. Test mobile and desktop cropping, contrast, font size and touch area.
- Visually compare actual screenshot to source artwork. Avoid stretched or blurry PNG and transparent-edge halos.
- Provide ALT text and adjacent explanatory words. Do not rely on color or animation alone.
- Asset sizes must be reasonable for mobile connections. Optimize and lazy-load rich artwork where appropriate.
- Distinguish **teaching visual** (concept illustration) from **UI diagram** (functional interactive element).

## Hackathon slice

- Current functional number line uses HTML/CSS, not SVG. Keep it for the first proof of the learning loop, but improve its art direction and interactive affordances before claiming a polished visual experience.
- Implemented first rich lesson: the interactive counting scene composes a large PNG background with transparent 3D apple/basket PNG sprites; plus/minus buttons update the visible count. See ASSET_SOURCES.md for license and screenshots. Further scenes remain future work.
- Do not spend the entire build window on artwork before the student response → adaptive teaching action loop passes tests.
