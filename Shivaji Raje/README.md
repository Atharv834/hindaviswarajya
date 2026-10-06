# Chhatrapati Shivaji Maharaj — React heritage site

A React + Vite rebuild of the 13-page Shivaji Maharaj tribute. All original page URLs, English/Marathi narrative text, sources, and footer text are retained. No changes were made to the sibling Sambhaji site.

## Run

```sh
npm install
npm run dev
npm run build
npm run preview
```

Publish the **dist/** directory produced by `npm run build`. All thirteen `.html` entry points are generated, so existing links work on ordinary static hosting without rewrite rules. Assets use relative paths, including when hosted under a subdirectory.

If the Windows npm shim reports a missing npm-cli.js, use the actual installed CLI:

```powershell
& 'C:/Program Files/nodejs/node.exe' 'C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js' run dev
```

## Structure and content

- `src/main.jsx`: shared React navigation with preloaded client-side page changes, responsive images, chapter navigation, language state, timeline, map interactions, seal button, and content rendering.
- `src/styles.css`: responsive heritage editorial design with reduced-motion support.
- `src/motion.jsx`, `src/motion.css`, `src/refinements.css`, and `src/details.css`: scroll-triggered entrances, CSS landscape parallax, chapter and timeline scroll progress, a tighter royal layout with larger text, reusable architectural detailing, and the accessible gallery dialog.
- `scripts/curate-images.mjs`: contextual image selection and responsive optimization; runs after migration. Source photos and seven built-in ImageGen illustrations are in `assets/curated/`. The Bhavani image is a credited Wikimedia Commons photograph.
- `DESIGN-NOTES.md`: reference websites, imagery decisions, generation specifications, and motion behavior.
- `src/content/*.json`: page-specific content trees rendered as native React elements. No injected HTML or legacy page scripts.
- `scripts/build-bootstrap-sprite.mjs`: builds only the Bootstrap Icons used by the interface into `public/icons/bootstrap.svg`; the MIT license is bundled beside it. `npm run dev` and `npm run build` regenerate the sprite automatically.
- `public/images/`: 480px, 960px, and 1600px WebP variants.
- `archive/*.html`: source pages for the migration. The requested Marathi wording for Shivaji Maharaj’s passing has been updated here and is reproduced in the generated content.
- `scripts/migrate.mjs`: reproducible content and image migration. Run `node scripts/migrate.mjs --content-only` to regenerate content without recompressing images. If changing content, edit the corresponding archived source first, then regenerate. Direct changes to generated JSON will be replaced by migration.
- `image-report.json`: source versus full-size optimized image byte counts. Smaller responsive variants are additional files, not included in the full-size comparison.

The original `assets/`, `styles/`, and older scripts are retained for reference but are not included in the production build. Several original image files contain a 522 error response. The only referenced broken image, `pratapgad-fort.jpg`, uses the existing valid Pratapgad photograph instead.

## Checks

```sh
node scripts/verify.mjs --content-only
npm test
node scripts/verify-motion.mjs
```

Full checks require Google Chrome installed and the dev server running at `http://127.0.0.1:5173`. Override this with `TEST_URL` to test the production preview. The checks compare original narrative/footer text exactly (ignoring whitespace), validate internal links and image references, and exercise all pages on desktop/mobile, Marathi layout, lazy image loading, keyboard timeline controls, map links, deep links, menu dismissal, and language persistence. Screenshots are written to ignored `test-results/`.

## Performance decisions

- No blocking seal intro, GSAP, ScrollTrigger, external font requests, or scroll-driven layout work.
- Hero image is preloaded with high fetch priority; lower-page images are lazy loaded with reserved space.
- Page content is split into individual chunks; React and CSS are shared and cached.
- Internal page links change the React view without a full document reload; direct `.html` URLs, browser Back, hash links, and reading-position restoration still work.
- Interface icons use one small, local SVG sprite, with no emoji, icon font, or external icon request.
- Original images total about 33.6 MB; full-size WebP equivalents total about 7.0 MB (79% smaller). The portrait is 119 KB at 960px versus the original 2.36 MB (about 95% smaller).
- This byte reduction is measured locally. Real-world loading speed and Core Web Vitals depend on hosting, caching, device, and network; no public Lighthouse score is claimed.
- Supporting imagery now uses real fort photographs, a photograph of the Tulja Bhavani idol, sourced artifacts, interpretive diagrams, and seven generated illustrations. `curated-image-report.json` measures their source-to-WebP size reduction. In-site credits preserve source links, photographers and licenses.
- Entrance animations use one observer; supporting image parallax uses native CSS view timelines with a static fallback. Progress updates use a throttled passive scroll listener. Reduced motion disables movement, while the main portrait stays intact.

Implementation guidance: [web.dev image loading](https://web.dev/articles/browser-level-image-lazy-loading) and [Fetch Priority](https://web.dev/articles/fetch-priority).
