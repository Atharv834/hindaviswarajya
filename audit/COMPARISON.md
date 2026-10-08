# Before and after review

The reproducible starting point is tag `baseline-before-museum-2026-10-08` (`b2af30fc5043675c920397f61ccc1249499bf975`). Screenshots were captured from the local development server with Chromium. Each pair uses the same viewport and reduced-motion setting. Full-page images include middle sections and footers; opening viewports are also available at 1920, 1440, 768, 390 and 360 pixels in `before/` and `after/`. The published URL could not be reached through the cloud proxy (HTTP 403), so these are local baseline comparisons.

| View | Before | After | Difference |
|---|---|---|---|
| Home, 390px | [full page](before/index-390-en-full.png) | [full page](after/index-390-en-full.png) | Original painted portrait, arch and palette retained; introduction uses more measured historical wording and clearer spacing. |
| Timeline, 1440px | [full page](before/timeline-1440-en-full.png) | [full page](after/timeline-1440-en-full.png) | Six original milestones and pinned scene retained; each card gets a native select button, uncertain oath language is qualified and evidence context is available. |
| Fort atlas, 390px | [full page](before/galleries-390-en-full.png) | [full page](after/galleries-390-en-full.png) | Cards move from narrow two-column mobile text to single-column reading; map is explicitly labelled schematic, with larger markers. |
| Legacy, 390px | [full page](before/legacy-390-en-full.png) | [full page](after/legacy-390-en-full.png) | Layout retained; unsupported fixed fort and cavalry numbers and naval honorific were replaced with dated or qualified context. |
| Raigad, 390px | [full page](before/fort-raigad-390-en-full.png) | [full page](after/fort-raigad-390-en-full.png) | Brief introduction now leads into a bilingual three-part fort exhibition with expandable source information and related reading. |

Interaction captures show the [mobile menu](after/interaction-mobile-navigation.png), [timeline](after/interaction-mobile-timeline.png), [atlas](after/interaction-mobile-atlas.png), [gallery dialog](after/interaction-mobile-gallery.png) and [Raigad evidence panel](after/interaction-raigad-evidence.png).

The same fort exhibition pattern is available on Pratapgad, Shivneri, Sindhudurg, Sinhagad and Panhala. The Southern Campaign also has bilingual context. All new references are given at the work level; no unverified page or manuscript identifiers were invented. The [source ledger](SOURCE-LEDGER.md) distinguishes established outlines, tradition, later text and unresolved claims.

## Validation

- All 13 existing routes loaded in the existing browser suite and the production build completed.
- Content verification compared the archive and generated JSON on all 13 pages.
- Browser checks covered English/Marathi, desktop/mobile, history, deep links, timeline, atlas, gallery, keyboard controls, route focus and source panels.
- Axe found no violations in its WCAG-tagged rule set on all 13 routes in both languages at 1440px and 390px. This automated result is not a full WCAG 2.2 AA certification.
- `before/metrics.json` and `after/metrics.json` show no horizontal document overflow or JavaScript page errors in the five compared pages at 1920, 1440, 768, 390 and 360 pixels.
- [Local performance measurements](performance.json) were taken from the production preview in headless Chromium on a warm machine without network or CPU throttling. Homepage LCP was 216ms at 1440px and 168ms at 390px; CLS was 0 in those runs. These are lab observations, not field Core Web Vitals or Lighthouse scores. INP was not measured.

## Remaining work

- External historical sources, manuscript provenance, photograph licenses and the live deployment could not be independently checked because the proxy returned HTTP 403 for those sites. Work-level references are research leads, not claim-specific citations.
- The page body still depends on React for initial historical text. Static pre-rendering needs a separate implementation that preserves route navigation, language state and GitHub Pages paths.
- Additional chronology beyond the existing six milestones and a full primary-document viewer require evidence and rights-cleared materials. No speculative events or manuscript scans were added.
- Automated accessibility checks do not replace manual screen-reader and assistive-technology testing. Local preview metrics do not predict production Core Web Vitals.

## Rollback

The original version can be inspected with `git switch --detach baseline-before-museum-2026-10-08`. To undo a merged enhancement without discarding unrelated commits, create a rollback branch from the current production branch and revert the enhancement commits in reverse order. Revert a merge commit with `git revert -m 1 <merge-sha>`; if the PR was squashed, revert its squash commit. For an individual phase, `git revert <phase-commit-sha>` preserves other history. Do not reset or force-push `main`.
