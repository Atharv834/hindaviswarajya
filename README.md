# Hindavi Swarajya

A bilingual React/Vite digital heritage site about Chhatrapati Shivaji Maharaj. The website has 13 static `.html` routes and lives in [`Shivaji Raje/`](./Shivaji%20Raje/). The original portrait and archive source pages are retained.

## Develop

Use Node.js 20 or later. From `Shivaji Raje/`:

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. `npm run build` creates the GitHub Pages-ready `dist/` directory, including route-specific metadata, `sitemap.xml` and `robots.txt`. `npm run preview` serves that build locally.

Run the content check with `node scripts/verify.mjs --content-only`. With the dev server running and Google Chrome installed, run `npm test`, `node scripts/verify-motion.mjs` and `node scripts/verify-museum.mjs` and `node scripts/verify-a11y.mjs`. The browser tests use `http://127.0.0.1:5173` by default; set `TEST_URL` to target a different local server. GitHub Actions runs these checks before deployment.

Historical narrative and translations in `Shivaji Raje/src/content/*.json` are generated from `Shivaji Raje/archive/*.html`. Edit the archive source first, then run `node scripts/migrate.mjs --content-only` and check the generated diff. The bilingual fort and campaign exhibition notes in `src/museum.jsx` are separately maintained editorial additions. Responsive image assets and credits are retained by the migration workflow.

See [`audit/`](./audit/) for the baseline, before/after screenshots, source ledger, measurements and rollback guidance. This branch does not publish the site automatically; deployment still follows the repository's main-branch workflow.
