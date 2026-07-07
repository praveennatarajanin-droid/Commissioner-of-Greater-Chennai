# Implementation Plan - MySQL Database Migration

Migrate the entire Chennai Guardian project data layer from local `db.json` file storage to MySQL.

## User Review Required

> [!IMPORTANT]
> The database migration will move all storage logic into a standard MySQL connection pool (`mysql2/promise`). The existing `db.json` operations will be completely removed, and the schema will be automatically generated and seeded via `npm run migrate:mysql`.

> [!NOTE]
> Database Details:
> - **Host**: `127.0.0.1`
> - **Port**: `3306`
> - **User**: `root`
> - **Password**: `(empty)`
> - **Database**: `chennai_guardian`

## Open Questions

None. The user has provided precise configuration parameters.

## Proposed Changes

### Database Connection Layer

#### [NEW] [mysql.ts](file:///d:/Commissioner%20Amalraj/src/lib/mysql.ts)
- Create a MySQL connection pool using `mysql2/promise` with variables from environment/defaults.
- Provide helper methods for querying and running transactions.

### Schema Migration Script

#### [NEW] [migrate.ts](file:///d:/Commissioner%20Amalraj/src/scripts/migrate.ts)
- Script that reads `db.json`.
- Dynamically creates the database `chennai_guardian` and all required tables with correct data types if they do not exist.
- Performs batched INSERTs using parameterized queries to populate all existing data from `db.json` into MySQL.
- Registers script command under `npm run migrate:mysql` in `package.json`.

### Database Provider Integration

#### [MODIFY] [db.ts](file:///d:/Commissioner%20Amalraj/src/lib/db.ts)
- Remove all `fs` and file storage dependencies (`fs.readFileSync`, `fs.writeFileSync`, `JSONDatabaseManager`).
- Update class `ChennaiGuardianDatabase` to query the MySQL connection pool instead of local JSON database.
- Keep exact method interfaces (`getNews`, `saveNews`, `getPoliceStations`, etc.) to ensure no frontend UI or routing code breaks.
- Handle transaction controls for any batch writes/mutations where needed.

## Verification Plan

### Automated Tests
- Type checking: `npx tsc --noEmit`
- Migration script test: `npm run migrate:mysql`

### Manual Verification
- Verify the application starts successfully and pages load without error.
- Verify news creation, admin panel login, contact us form submissions, and station search works correctly.
