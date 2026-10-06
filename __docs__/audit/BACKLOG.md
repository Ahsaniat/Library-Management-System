# Audit Remediation Backlog

Source audit: [`audit-oct6.md`](./audit-oct6.md)
Status legend: `[ ]` open · `[~]` in progress · `[x]` done

## S0 — Critical

- [ ] F-001 Block privilege escalation on register (`role` accepted from client body)
- [ ] F-002 Fail fast on missing/weak JWT secrets; require compose secrets
- [ ] F-003 Refresh token rotation, revocation, logout endpoint, token versioning

## S1 — High

- [ ] F-004 Move refresh token to HttpOnly cookie; access token memory-only
- [ ] F-005 Migrate server + client to ESLint flat config; unblock CI lint
- [ ] F-006 Root workspace with Playwright dependency and scripts
- [ ] F-007 Meaningful service/validator tests + coverage thresholds
- [ ] F-008 sequelize-cli, committed migrations, remove schema sync
- [ ] F-009 Scheduler for due reminders, overdue notices, reservation expiry
- [ ] F-010 Wire welcome/password-reset emails; add auth pages/routes
- [ ] F-011 Expire verification tokens; enforce verification per environment
- [ ] F-012 Whitelist sortBy/sortOrder and validate all search params
- [ ] F-013 Fix catalog contract: category by ID, available bool, author search, Home links
- [ ] F-014 Barcode-based checkout/checkin
- [ ] F-015 Enforce reservation queue before checkout
- [ ] F-016 Reservation expiry + next-in-line promotion + queue bookkeeping
- [ ] F-017 Fine/payment management API + client pages
- [ ] F-018/F-033 Soft delete users/books; guard deletion of active records
- [ ] F-019 .dockerignore, non-root containers, production-only dependencies
- [ ] F-020 Trust proxy so rate limiting works behind nginx
- [ ] F-021 Cap number of copies; unify barcode generation
- [ ] F-022 Strip unknown fields with matchedData/allowlists

## S2 — Medium

- [ ] F-023 Remove duplicate `copies` include when filtering availability
- [ ] F-024 Bound pagination on every list endpoint
- [ ] F-025 Pin JWT algorithms/issuer/audience and token type
- [ ] F-026 Hash verification and reset tokens
- [ ] F-027 Escape user content in email templates
- [ ] F-028 Settings service + seeded policy defaults; remove hardcoded values
- [ ] F-029 Reviews API + rating recalculation
- [ ] F-030 Audit log entries for sensitive mutations
- [ ] F-031 Library CRUD and scoping of copies
- [ ] F-032 Copy management endpoints; capture condition at return
- [ ] F-034 Wire report tabs and CSV export
- [ ] F-035 Toast/confirm components; surface mutation errors
- [ ] F-036 User picker / barcode input for admin flows
- [ ] F-037 Route admin pages through the hooks layer
- [ ] F-038 Extend design tokens; remove raw colors
- [ ] F-039 Accessibility labels, keyboard dropdown, focus states
- [ ] F-040 Debounce search inputs
- [ ] F-041 Finish repo hygiene (agent.log history, test artifacts)
- [ ] F-042 Rotate secrets; keep .env out of Docker context
- [ ] F-043 Harden docker-compose (no default password, no exposed DB port, healthchecks)
- [ ] F-044 Error boundary + shared API error extractor
- [ ] F-045 Validate admin inputs (create user, role, status, pagination)
- [ ] F-046 Validate book-request processing; add CANCELLED status
- [ ] F-047 PATCH semantics for book updates; surface copy-count conflicts

## S3 — Low

- [ ] F-048 Remove dead exports/hooks/dependencies; declare missing devDeps
- [ ] F-049 Remove empty directories and stale scripts
- [ ] F-050 Align Node engines (>=22) and pin .nvmrc
- [ ] F-051 Guard destructive seeding; crypto-random barcodes
- [ ] F-052 Guard client/server enum drift with a test
- [ ] F-053 Lazy-load routes; hide production sourcemaps
- [ ] F-054 Close navigation gaps (wishlist, requests, profile, admin requests)
- [ ] F-055 Standardize error envelope and HTTP semantics
- [ ] F-056 Remove PII from logs; de-duplicate request logging
- [ ] F-057 Centralize fine calculation policy
- [ ] F-058 Standardize language codes and remaining theme colors
- [ ] F-059 OpenAPI spec + correct documentation claims
- [ ] F-060 Harden nginx (security headers, body size, rate limits)
- [ ] F-061 Validate wishlist priority/notes; expose them in UI
- [ ] F-062 Return explicit user DTOs
- [ ] F-063 Sortable UUIDs + crypto barcodes
- [ ] F-064 Book-request cancellation semantics

## Verification

- [ ] `server`: `npm run lint`, `npm run build`, `npm run test`
- [ ] `client`: `npm run lint`, `npm run build`
- [ ] Root: `npm run test:api` / `npm run test:e2e` (requires Postgres)
