# Motion and imagery pass

## Design direction

An illustrated heritage archive: warm parchment, basalt ink, saffron details, expansive photographs, and a measured sense of movement. The home portrait and its arch retain their original presentation. The narrative, sources, links and footer remain as supplied except for the user-requested Marathi wording for Shivaji Maharaj’s passing.

Research informed the interaction direction, not a copied layout:

- [Rijksmuseum: Closer to Johannes Vermeer](https://www.rijksmuseum.nl/en/stories/themes/vermeer/story/closer-to-johannes-vermeer): close inspection and image-led storytelling inspired the enlarged gallery.
- [Louvre online tours](https://www.louvre.fr/en/online-tours): connected exploration informed chapter navigation and fort discovery.
- [Ordinary Folk](https://www.ordinaryfolk.co/): composed motion inspired staggered entrances and restrained easing.
- [National Geographic](https://www.nationalgeographic.com/): editorial visual storytelling informed pairing images with narrative.
- [web.dev: high-performance animations](https://web.dev/articles/animations-guide): transform and opacity animation, rather than repeatedly animating layout.
- [web.dev: Optimize Cumulative Layout Shift](https://web.dev/articles/optimize-cls): reserve space and avoid layout-changing motion, while distinguishing visual jitter from measured layout shift.
- [React: useTransition](https://react.dev/reference/react/useTransition): retain visible page content while the next React page chunk is prepared.

## Motion implementation

The geometric Rajmudra-style engraving from the home page now recurs at varied scales across all 13 pages: in chapter margins, selected story and chronology cards, map and legacy sections, closing links, and footers. A second code-native SVG traces Sahyadri contours behind the fort network, southern campaign, navy, economy, and culture sections. Both motifs are low-opacity CSS backgrounds that avoid new image requests and preserve the narrative and photographs. The layout reduces their size and contrast on phones, and the slow transform-only watermark movement follows the reduced-motion preference.

`src/motion.jsx` shares one IntersectionObserver per page. Images and editorial panels enter as they become visible, and compact cards stagger. Content is never left hidden waiting for JavaScript. CSS named view timelines move supporting landscapes within clipped frames without a JavaScript parallax loop. Browsers without scroll timelines still receive entrance and interaction animations.

The first viewport stays readable on reload: only the title receives a short, low-distance entrance, while in-view sections skip the delayed scroll reveal. Below the fold, artwork and cards still enter with smaller transform/opacity movement. A fine parchment texture and code-native geometric watermark add depth; only the watermark's transform moves slowly. The main portrait has no new transform or animation. The hero scales to shorter desktop viewports, with larger supporting text and a stronger royal frame treatment. The full landscape council illustration is displayed without cropping. Timeline milestones are stacked for reading, while the image and year controls stay pinned; scrolling into each card advances the selected year and scene. Direct year buttons and the keyboard slider still work. Fort pins pulse; cards, links and controls respond to hover/focus. A requestAnimationFrame-throttled passive scroll listener updates reading progress and the active chapter. The gallery opens a native dialog, uses the largest available image, supports Escape and backdrop dismissal, locks background scrolling and restores focus.

Internal `.html` links now switch pages inside React. Page chunks are prefetched on hover or focus, and a React transition leaves the current content in place until the next page is ready. Direct page URLs still work on static hosting. Browser Back restores the stored reading position; a manual reload also restores it after the page content mounts. Hash links jump into place immediately during a reload so they do not visibly tween from the top.

The operating-system reduced-motion preference disables these movements, including if it changes while the page is open. No animation package, external font, video background, blocking introduction, or continuous JavaScript render loop was added.

## Imagery and authenticity

`assets/curated/` holds the source files. `public/images/curated-*` contains responsive WebP derivatives or small code-native SVG diagrams. `src/content/credits.json` supplies the in-site image credits, source links and licenses. Photographs are attributed to their photographers; derivative photographs retain the original license. Historical scenes are explicitly described as artistic reconstructions in the credits, not documentary photographs.

The new arms, naval and cavalry illustrations replace unrelated reused images. The Bhavani gallery image is now an authentic photograph of the Tulja Bhavani idol at Tuljapur by Varun sakpal, licensed CC BY-SA 4.0, [sourced from Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Aai_tuljabhavani.jpg). Named fort sections use photos of the actual forts. The southern campaign uses Jinji and Thanjavur. The naval-ensign section shows the actual ensign. A sourced gold Hon and a dated Modi correspondence scan replace reused fort imagery. The fort-network diagram and Torna ridge diagram are interpretive schematics, not surveyed plans. The Rajmudra is a recreated inscription, not a claimed original artifact.

The original portrait source and all three optimized portrait files are checked by SHA-256 in `scripts/verify-motion.mjs`.

## Generated images

Tool: **OpenAI built-in ImageGen**, used directly without an API-key workflow. Outputs were copied into this project before being referenced. The following records describe the scene specifications used for generation; these are prompt summaries rather than transcripts.

| Saved source | Prompt specification |
| --- | --- |
| `assets/curated/sahyadri-sunrise.png` | Wide painterly Sahyadri dawn landscape: layered misty Maval hills, basalt rampart, warm saffron sunlight, editorial historical atmosphere, no text or watermark. |
| `assets/curated/coronation.png` | Painterly reconstruction of the 1674 coronation at Raigad: Shivaji in white jama and saffron turban, golden throne and parasol, Brahmin ritual, period royal hall, landscape composition, no text. |
| `assets/curated/maratha-navy.png` | Seventeenth-century Maratha wooden coastal fleet with lateen sails and saffron pennants, Konkan sea walls, teal water, atmospheric historical painting, no modern ships or text. |
| `assets/curated/maval-cavalry.png` | Maratha horsemen advancing over a Sahyadri ridge with a saffron banner, period clothing and arms, dust and warm daylight, painterly editorial historical scene, no text. |
| `assets/curated/maval-arms.png` | Still-life illustration of a curved talwar, dagger and four-boss shield on saffron cloth, period materials and painterly lighting, no text. |

| `assets/curated/gold-throne.png` | Empty gold ceremonial throne associated with the 1674 coronation, illustrated reconstruction, red silk cushion, lion forms at the base, parasol, dark basalt hall, warm side light, full throne visible, 3:2 composition, no people or text. |
| `assets/curated/ashtapradhan-council.png` | Seventeenth-century administrative council at Raigad: Shivaji in white jama and saffron turban with eight ministers discussing accounts and correspondence, ledgers and ink vessels, stone arches and Sahyadri views, painterly period interpretation, no readable text or modern furniture. |

Exact prompts for the two additional images:

**Gold throne:** “Use case: historical-scene. Create a refined museum editorial illustration for a Shivaji Maharaj heritage website. Subject: the gold ceremonial throne associated with the coronation at Raigad in 1674, shown EMPTY as an artistic reconstruction, with ornate period Indian carved gilded details, red silk cushion, two modest lion forms at the base, and a richly worked ceremonial parasol above. Dark basalt royal hall, soft warm sidelight. The throne itself is the clear central subject, front three-quarter view, full throne visible with enough margins for responsive crops. Painterly realism, delicate visible brush texture, restrained saffron and antique gold palette, deep olive charcoal shadows. Landscape 3:2 composition. No people, no text, no logos, no watermark. Do not depict as a photograph of an extant artifact; make it visibly an elegant illustrated historical interpretation.”

**Council:** “Use case: historical-scene. Asset: supporting image in a React educational heritage website about Shivaji Maharaj, governance and the Ashtapradhan council. Create a detailed painterly historical interpretation of a 17th-century Maratha administrative council at Raigad: Shivaji in a white jama with a saffron turban seated modestly at the far head of a council, eight ministers seated on cushions around a low long desk discussing accounts and correspondence. Documents and ink vessels, cloth-bound ledgers, discreet royal seal on the desk, stone palace interior, natural daylight through carved arches, a glimpse of the Sahyadri hills. The focus is thoughtful administration and consultation, not coronation, battle or worship. Believable period clothing, no modern furniture, no European clothing. Rich muted ochre, ivory, terracotta and charcoal olive, hand-painted oil illustration with subtle brushwork. Wide landscape 3:2, balanced editorial composition, figures not cut off, suitable for desktop landscape and mobile crops. No readable text or letters, no logo, no watermark.”

## Reproduction and checks

Run `node scripts/migrate.mjs --content-only` to regenerate the original content trees and apply contextual curation. It also invokes `scripts/curate-images.mjs`, which creates responsive variants and applies the image replacements. Download scripts are optional source-maintenance tools, not build dependencies. They retain public-domain/Creative Commons/GODL metadata and do not run during a normal build.

`node scripts/verify.mjs` checks all 13 pages and exact original text, mobile/desktop and Marathi layouts, links, images, menu, timeline, map and deep links. `node scripts/verify-motion.mjs` checks actual animated entrances, scroll-driven image movement, reading progress, reduced motion, portrait checksums, mobile dialog layout and keyboard focus restoration. `TEST_URL` selects the production preview for either suite.

The WebP byte comparison is in `curated-image-report.json`; it compares source files with their largest generated WebP variants, not network speed or Core Web Vitals. Smaller responsive variants are additional files.
