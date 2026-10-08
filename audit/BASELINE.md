# Baseline audit — 8 October 2026

Baseline commit: `b2af30fc5043675c920397f61ccc1249499bf975`; rollback tag: `baseline-before-museum-2026-10-08`. Development branch: `feat/heritage-museum-enhancements`.

Local Chromium screenshots are in `audit/before/` at 1920×1080, 1440×900, 768×1024, 390×844 and 360×800 for the homepage, timeline, fort atlas, legacy and Raigad. English and Marathi opening viewports were captured at 1440 and 390. The local pages returned HTTP 200, no page exceptions and no document overflow at those widths. The production URL could not be inspected: the configured proxy returned HTTP 403 to `atharv834.github.io`.

| Finding | Location | Severity | Proposed correction |
|---|---|---|---|
| Campaign and commanders are absent from the five-item global navigation | Every page | High | Group all major topics in a keyboard-accessible Explore menu. |
| Every page except Legacy continues to the same generic destination | Interior pages | Medium | Add breadcrumbs and contextual reading links. |
| Six fort detail pages contain only a brief introduction | Fort pages | High | Add bilingual, source-labelled mini-exhibitions without fabricating dates or artifacts. |
| Timeline cards use clickable `<div>` elements | Timeline | High | Provide keyboard selection and visible active state. |
| Large historical claims and attributed quotations lack specific provenance | Timeline, letters, forts, legacy | High | Qualify unverified tradition/numbers; show evidence classification and source ledger. |
| Small labels and body text occur across sections; mobile fort cards have narrow text columns | Shared CSS, atlas at 390px | Medium | Improve type scale and one-column mobile reading. |
| Only client-side document titles update; canonical, social metadata and sitemap are missing | All route entry HTML | Medium | Generate route metadata and sitemap; assess static content separately. |

The original portrait, parchment/basalt/saffron palette, English/Marathi switch, 13 URLs, responsive images, galleries, timeline and reduced-motion behavior are baseline assets to preserve. `src/content/*.json` is generated from `archive/*.html` by `scripts/migrate.mjs`; historical text corrections must begin in archive source.
