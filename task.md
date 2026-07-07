# Tasks - MySQL Database Migration, Stations Fix & About Us Menu

- [x] Define the `.env` database parameters
- [x] Create connection pool layer `src/lib/mysql.ts`
- [x] Implement database migration script `src/scripts/migrate.js`
- [x] Register script command in `package.json`
- [x] Execute `npm run migrate:mysql` to create and populate tables
- [x] Seed 103 comprehensive Chennai police stations dataset (incl. Meenambakkam, Chromepet, Tambaram, etc.)
- [x] Implement typo-tolerant, case-insensitive fuzzy matching (`isTypoMatch`)
- [x] Remove the popup detail modal and replace with dedicated page routing at `/stations/[slug]`
- [x] Design and build StationDetailClient view with complete detailed panels, maps, directions, and nearby station listings
- [x] Revert About Us page layout back to the original version and component (`AboutUsClient`) under the `/about` route
- [x] Add ABOUT US header navigation link pointing to `/about` immediately after HOME and before CRIME categories
- [x] Highlight active menu link on `/about` route
- [x] Type-check project with `npx tsc --noEmit`
- [x] Verify functionality (auth, news creation, dashboard, stations, search)
