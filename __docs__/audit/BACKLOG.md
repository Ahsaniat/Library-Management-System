# Audit Remediation Backlog — Closeout

Source audit: [`audit-oct6.md`](./audit-oct6.md)
Status: `[x]` done · `[~]` done with noted follow-up

All S0 and S1 findings are fixed and verified (unit tests, live API tests
against PostgreSQL, client build/typecheck).

## S0 — Critical (all fixed)

- [x] F-001 Privilege escalation on register — role is never client-selectable
- [x] F-002 Secret fail-fast + compose requires secrets
- [x] F-003 Refresh rotation/revocation, tokenVersion, logout endpoint

## S1 — High (all fixed)

- [x] F-004 HttpOnly refresh cookie; memory-only access token
- [x] F-005 Flat ESLint configs; CI lint gate restored
- [x] F-006 Root package + Playwright; API job in CI
- [x] F-007 Auth/validation coverage + coverage gate (15%+)
- [x] F-008 sequelize-cli migrations; startup sync removed
- [x] F-009 Scheduler for reminders, overdue notices, reservation expiry,
      token cleanup
- [x] F-010 Verification/reset emails wired; auth pages added
- [x] F-011 Verification expiry + enforcement flag
- [x] F-012 sortBy/sortOrder whitelisted; search params validated
- [x] F-013 Catalog contract fixed (category IDs, available flag, author
      search, sort links)
- [x] F-014 Barcode checkout/checkin
- [x] F-015 Reservation holds enforced at checkout
- [x] F-016 Hold expiry, promotion, queue bookkeeping
- [x] F-017 Fines/payment/waiver API + member/staff pages
- [x] F-018/F-033 Soft deletes; delete guards
- [x] F-019 `.dockerignore`; non-root runtime; prod-only deps
- [x] F-020 Trust proxy; correct rate-limit keys
- [x] F-021 Copy-count cap; unified crypto barcodes
- [x] F-022 matchedData allowlists on every write route

## S2 — Medium

- [x] F-023 No duplicate copies join
- [x] F-024 Pagination everywhere; bounded limits
- [x] F-025 HS256/issuer/audience pinning; unique `jti`
- [x] F-026 Tokens stored as SHA-256 hashes
- [x] F-027 Email template HTML escaping
- [x] F-028 Settings service + seeded policy defaults
- [x] F-029 Reviews API + real ratings
- [x] F-030 Audit log written on sensitive mutations
- [x] F-031 Library CRUD API
- [x] F-032 Copy management + condition capture on return
- [x] F-034 Reports wired; CSV export
- [~] F-035 Alert/ConfirmDialog introduced and used in the main flows;
      a few pages still use inline banners
- [x] F-036 Borrower typeahead; barcode inputs
- [~] F-037 Dead hooks removed; admin pages still call the API directly
      (follow-up: move them onto hooks)
- [x] F-038 Status design tokens added and used by new components
- [~] F-039 aria-labels on icon actions and menus; broader a11y audit
      (Lighthouse/axe in CI) is a follow-up
- [x] F-040 Debounced admin search
- [x] F-041 `.gitignore` repaired; artifacts untracked (history rewrite
      for the old agent log not performed)
- [~] F-042 `.env` kept out of Docker context; rotate the exposed local
      credentials manually
- [x] F-043 Compose hardened; migrate service
- [x] F-044 ErrorBoundary + API error extractor
- [x] F-045 Admin input validation
- [x] F-046 Book-request validation + cancelled status
- [x] F-047 PATCH semantics; copy-removal conflict

## S3 — Low

- [x] F-048 Dead code/deps removed (zod, multer, morgan, dead hooks)
- [x] F-049 Empty directories removed
- [x] F-050 Node >=22 + `.nvmrc`
- [x] F-051 Destructive seed guarded
- [x] F-052 Client/server enum parity test
- [x] F-053 Lazy routes; hidden sourcemaps
- [x] F-054 Navigation gaps closed
- [x] F-055 Error envelope standardized
- [x] F-056 Log redaction; duplicate request logging removed
- [x] F-057 Fine policy driven by settings
- [~] F-058 Language codes standardized; a handful of legacy inline colors
      remain
- [x] F-059 Endpoint reference added (`__docs__/api/endpoints.md`)
- [x] F-060 nginx security headers and limits
- [~] F-061 Wishlist validation added; priority/notes surfacing in the UI
      is a follow-up
- [x] F-062 Explicit user DTOs
- [~] F-063 Crypto barcodes; UUIDv4 primary keys retained (UUIDv7
      migration deferred)
- [x] F-064 Cancellation semantics fixed

## Verification

- [x] `server`: lint, build, 69 unit tests, coverage 15% (gate 10%)
- [x] `client`: lint, typecheck, production build with route chunks
- [x] Live API suite: 15/15 against PostgreSQL (auth, catalog, circulation,
      fines, reports)
- [x] Migrations applied and re-runnable
