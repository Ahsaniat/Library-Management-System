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

## Runtime walkthrough (browser)

Scenario walkthrough (member borrow, librarian barcode checkout/return with
condition, fine partial payment/payment/waiver, reports, settings, users,
books) surfaced and fixed five additional defects:

- Guests were redirected to `/login` from every book page (wishlist check
  returned 401). Fixed with optional-auth endpoint, gated hook and a guest-
  safe 401 interceptor.
- Librarians received 403 on the borrower typeahead; user reads are now
  librarian-visible while mutations stay admin-only.
- The checkout modal posted scanner values as UUIDs; it now routes through
  the barcode-aware service.
- Modal scrims used Tailwind v3 `bg-opacity-50` (removed in v4), rendering an
  opaque black void; replaced with `bg-black/60` plus dialog semantics.
- The footer rendered on every route; it is now landing-page only. Overdue
  loans show borrower names instead of UUIDs, and Waive is admin-only in the
  UI.

## Deferred items — rationale

| Item | Why it is deferred | Risk if not addressed |
|---|---|---|
| F-037 Admin pages call the API directly | Pure internal refactor with no user-visible or security impact; moving ~150 lines onto hooks risks churn late in the cycle. Dead hooks were removed so there is one clear pattern left to migrate to. | Low: duplicated query keys and harder testability |
| F-039 Full a11y audit | Requires running axe/Lighthouse across every page and fixing systemic focus-trap behaviour in modals; key gaps found in the audit (icon-only buttons, hover-only menus, dialog roles) were fixed. | Medium: WCAG compliance cannot be claimed without the full pass |
| F-041 Rewriting git history to purge the old agent log | Rewriting shared history invalidates every commit hash and forces a force-push that can break clones; the log was removed from the tree, untracked and `.gitignore` repaired. | Low: the historical file remains readable in old commits |
| F-042 Rotating `server/.env` credentials | Secrets live on the operator's machine, not in the repository; only the owner can rotate them at the providers (DB, Gmail app password, JWT). The Docker context now excludes `.env`. | High if the file leaks — rotate before sharing the directory |
| F-058 Remaining inline colors on older pages | Cosmetic; token set and new components use it, but migrating every legacy inline style is a design pass best done alongside a visual review. | Low |
| F-061 Wishlist priority/notes UI | API and validation exist; exposing them needs UX decisions (drag-to-rank vs numeric). Not required for circulation correctness. | Low |
| F-063 UUIDv7 primary keys | Changing primary-key generation is a schema/data migration with no functional gain at current scale; barcodes already use crypto randomness. | Low until very high write volume |
| Token in local `git` remote URL | Stored by the operator for pushing during this session; must be revoked and the remote URL cleaned manually. | High — revoke it |

