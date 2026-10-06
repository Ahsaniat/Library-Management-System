Auditor: Code-Base-Auditor (AI)
Date: 2026-10-06
Scope: repository root, server/, client/, __tests__/, __docs__/, .github/, Docker/compose, nginx
Files enumerated: 160 tracked; 118 read in full (all source, models, routes, controllers, services, middleware, validators, client pages/hooks/services/components, docs, CI, tests, Docker)
Toolchain evidence executed: tsc --noEmit (both workspaces, pass), npm run lint (both, fail with ESLint 9 flat-config error, exit 2), npm run test:unit (19 trivial tests pass), git history inspection, dependency-tree checks
Total findings: S0: 3 · S1: 19 · S2: 25 · S3: 14 — 61 findings
S0 — Critical
F-001 Privilege escalation: POST /auth/register accepts client-supplied role
- File: server/src/services/authService.ts:47 (role: data.role ?? UserRole.MEMBER), server/src/controllers/authController.ts:8 (passes req.body wholesale), server/src/validators/auth.ts:3-25 (no role field)
- Evidence: express-validator does not strip unknown body fields, and the service trusts data.role. Sending {"email":"x@x.com","password":"Passw0rd!","firstName":"a","lastName":"b","role":"admin"} creates an admin. The client never sends role, so no test catches it.
- Blast radius: Every route in the system — full administrative takeover (user management, book deletion, financial reports).
- Fix: Force role: UserRole.MEMBER in authService.register; delete role from RegisterData; if admin-initiated accounts are needed, use the existing admin-only POST /admin/users. Add an integration test asserting role escalation is impossible. Adopt matchedData(req) (allowlist) in validate() as the systemic fix (see F-022).
F-002 JWT secrets silently default to public values; compose can inject empty secrets
- File: server/src/config/index.ts:93-96 (getEnvVar('JWT_SECRET', 'dev-secret-change-in-production'), same for refresh), docker-compose.yml:34-35 (JWT_SECRET: ${JWT_SECRET})
- Evidence: If JWT_SECRET is missing, tokens are signed with a well-known string in every environment. If compose runs without the env var, Docker sets it to empty and getEnvVar returns '' (defined, not undefined) — token signing then throws at first login.
- Blast radius: Anyone who knows the default can forge an admin token and call every protected endpoint. A production misconfiguration is invisible at boot.
- Fix: Remove defaults for JWT_SECRET/JWT_REFRESH_SECRET; validate at boot: present, length >= 64, and not equal to any example value; process.exit(1) with a clear message otherwise. Use compose required syntax: ${JWT_SECRET:?JWT_SECRET is required}. Same for DB_PASSWORD (require non-empty).
F-003 Sessions are unrevocable: no refresh rotation, no server-side invalidation
- File: server/src/middleware/auth.ts:79-107, server/src/services/authService.ts:150-176, server/src/middleware/auth.ts:16-36
- Evidence: refreshTokens accepts any valid refresh JWT, issues a fresh pair, and never persists or invalidates the old one. Logout exists only in the client store. Password change/reset does not invalidate outstanding tokens. ADR-003 and pen_test_plan.md:61 claim rotation; both are false.
- Blast radius: A stolen refresh token grants 7 days of access; after a password reset the attacker's session survives; incident response has no kill switch.
- Fix: Persist refresh tokens (hash + jti + user agent/IP + expiry) and rotate on every use with reuse-detection. Add tokenVersion (or sessionsValidAfter) to User; reject access/refresh tokens issued before it; bump on password change/reset/deactivate. Add POST /auth/logout that deletes the refresh record.
S1 — High
F-004 Access and refresh tokens persisted in localStorage
- File: client/src/store/authStore.ts:16-51 (persist of accessToken, refreshToken, user)
- Evidence: Any XSS on the origin can exfiltrate a 7-day refresh token; there is no CSP (see F-060).
- Blast radius: Full account takeover for every user, including admins.
- Fix: Move refresh token to an HttpOnly; Secure; SameSite=Strict cookie set by the server; keep the access token in memory only (Zustand non-persisted or sessionStorage at most). Add CSP and a BFF/proxy refresh endpoint. Server must read the cookie in refreshTokens and set/clear it on login/refresh/logout.
F-005 Both ESLint setups are broken; CI lint gate fails/ is masked
- File: server/.eslintrc.js + server/package.json:68 (eslint 9), client/package.json:45 (eslint 9, no config file), .github/workflows/ci.yml:41-42, :75-77
- Evidence executed: npx eslint src --ext .ts in server/ exits 2 with “ESLint couldn't find an eslint.config.(js|mjs|cjs) file.” Client has no config at all and CI marks it continue-on-error: true.
- Blast radius: Every lint rule in the repo (no-explicit-any, no-unused-vars, security plugin) is inert; the server CI job fails on every push.
- Fix: Migrate both to eslint.config.mjs (typescript-eslint flat config) or pin ESLint 8; add client config with react-hooks; remove continue-on-error; make lint a required check.
F-006 The Playwright API/E2E suite is orphaned and unreproducible
- File: playwright.config.ts (root), __tests__/**, repository root
- Evidence: There is no root package.json, @playwright/test is declared in no package.json, and no test:api/test:e2e scripts exist. test-results/.last-run.json (committed) records a failed run.
- Blast radius: 28 intended tests cannot run in CI or by a new contributor; the documented npm run test:api command from the project log does not exist.
- Fix: Add a root package.json with npm workspaces (client, server), @playwright/test devDependency, test:api/test:e2e scripts, and a CI job with npx playwright install --with-deps. Stop tracking test-results/.
F-007 Effectively no test coverage of business logic
- File: server/tests/unit/errors.test.ts, server/tests/unit/helpers.test.ts; empty __tests__/unit, __tests__/integration, __tests__/security
- Evidence: 19 tests, all pure helpers/error classes. Zero tests for loan checkout race conditions, reservation queue, fines, auth, role guards, validators, or any controller. No coverage threshold; CI never runs integration/E2E.
- Blast radius: The S0/S1 logic bugs in this report (role escalation, queue bypass, filter breakage) are exactly what service-level tests would catch.
- Fix: Integration tests with a disposable Postgres (testcontainers or the CI service) covering: register role rejection, loan/return lifecycle + fines, reservation FIFO and expiry, RBAC per route, validation failures. Add coverage.thresholds and run it in CI.
F-008 No migrations committed; sequelize-cli is missing; sync({ alter: true }) is the schema strategy
- File: server/package.json:19-22 (db:migrate, db:seed), empty database/migrations/, database/seeds/, server/src/config/database.ts:37-45
- Evidence: node_modules/.bin/sequelize-cli does not exist, so npm run db:migrate fails. Dev uses sequelize.sync({ force, alter: true }) (known data-loss/column-drop footgun); production uses bare sync().
- Blast radius: Production schema drift is unmanageable; request.md and README instruct migrations that cannot run.
- Fix: Add sequelize-cli + .sequelizerc + config; generate an initial migration for all 17 models; delete sync({alter}) usage (keep sync() only for tests); make db:migrate part of deploy.
F-009 No scheduler: reminders, overdue notices, and reservation expiry never execute
- File: server/src/services/notificationService.ts:134,177, server/src/services/reservationService.ts:141
- Evidence: sendDueReminders, sendOverdueNotices, processExpiredReservations are defined and never called; no cron/queue dependency exists (node-cron, BullMQ, etc. absent). README claims “Automated fine calculation, email notifications.”
- Blast radius: Reservation holds never expire, the queue stalls (F-016), no member is ever notified, overdue fines only appear at check-in.
- Fix: Add a job runner (node-cron inside the API process, or BullMQ for multi-instance), with distributed locking for scale: nightly due reminders; daily overdue notices + idempotent fine accrual rows; hourly reservation-expiry sweep + promotion. Expose an admin-only manual trigger for testing.
F-010 Email-dependent flows are completely broken; forgot-password page doesn't exist
- File: server/src/services/emailService.ts:77,83, server/src/services/authService.ts:38-53,93-109, client/src/pages/Login.tsx:79
- Evidence: sendWelcomeEmail and sendPasswordResetEmail have zero callers. register generates a verification token but emails nothing; forgotPassword returns the token while the controller discards it. Login links to /forgot-password, which has no route or page (App.tsx). server/.env also misconfigures SMTP (smtp.google.com, port 587 with SMTP_SECURE=true — requires smtp.gmail.com and STARTTLS).
- Blast radius: Users can never verify email or recover accounts; registration UI tells them to “check your email” for a message that will never arrive.
- Fix: Call emailService.sendWelcomeEmail in register and sendPasswordResetEmail in forgotPassword; add ForgotPassword, ResetPassword/:token, and VerifyEmail/:token pages plus routes; fix SMTP env (smtp.gmail.com, SMTP_SECURE=false for 587); add verifyConnection() startup warning.
F-011 Email verification is decorative; tokens never expire
- File: server/src/services/authService.ts:55-68 (no isEmailVerified check), :79-91 (no expiry check)
- Evidence: Register sets isEmailVerified: false, login ignores it, and verification tokens have no createdAt/expiry check despite the email template promising “This link will expire in 24 hours.”
- Blast radius: Spam accounts and impersonation; the “verified” flag is meaningless.
- Fix: Store verification token hash + expiry (24h); reject login (or restrict borrowing) until verified; add resend-verification endpoint with rate limit.
F-012 sortBy/sortOrder are unvalidated and flow into Sequelize order
- File: server/src/controllers/bookController.ts:12-13, server/src/validators/book.ts:107-133, server/src/services/bookService.ts:96
- Evidence: The validator whitelists only q, page, limit, category, author, year, available; sortBy is interpolated directly: order: [[sortBy, sortOrder.toUpperCase()]].
- Blast radius: Any authenticated/匿名 caller can cause 500s; whether an identifier-injection vector exists depends on Sequelize quoting, but user-controlled SQL identifiers should never reach the ORM unwhitelisted.
- Fix: Validate sortBy with .isIn(['title','publishedYear','averageRating','totalRatings','createdAt']) and sortOrder .isIn(['asc','desc']); map enum → DB column inside the service, never trust the raw string.
F-013 Search/filter contracts are broken in four places
- Files:
- client/src/pages/Books.tsx:157-161 sends category as free text (“Fiction”) but validators/book.ts:120-122 requires isUUID → every category filter 400s.
- client/src/pages/Books.tsx:121-127 promises author search, but bookService.search (server/src/services/bookService.ts:54-60) searches only title/ISBN/description — no author join.
- “Available Only” never works: validators/book.ts:129-132 .toBoolean() makes it a real boolean, then bookController.ts:18 compares === 'true' (always false).
- Home.tsx:70,90 links ?sort=popular|recent, but Books.tsx:37 reads sortBy — links do nothing.
- Blast radius: The only discovery surface for a library catalog (search/filter) is unreliable; users conclude books don't exist.
- Fix: Add a category list endpoint (GET /categories) and use a select of IDs; add author-name search server-side; compare with req.query.available === true; change Home links to ?sortBy=totalRatings&sortOrder=desc and ?sortBy=createdAt&sortOrder=desc. Add Playwright coverage for each filter.
F-014 Staff cannot check out or return by barcode — the UI promises it, the API forbids it
- File: client/src/pages/admin/LoanManagement.tsx:202-206,245-249, server/src/validators/loan.ts:3-14, server/src/services/loanService.ts:136
- Evidence: Placeholders say “Book Copy ID / Barcode”, but checkoutValidator requires bookCopyId to be a UUID and the service does findByPk. Entering a barcode (the whole point of a circulation desk) returns 400.
- Blast radius: Daily library operation is impossible without pasting UUIDs; the barcode field on BookCopy is unused by every endpoint.
- Fix: Accept barcode (or bookCopyId) and resolve via BookCopy.findOne({where:{barcode}}); same for check-in. Add GET /book-copies/lookup?barcode= for scanner UIs. Keep UUID path for API clients.
F-015 Self-checkout bypasses the reservation queue; holds don't hold anything
- File: server/src/services/loanService.ts:28-132, :358-384
- Evidence: selfCheckout takes any AVAILABLE copy for the requesting user. When a reservation becomes READY, the copy is not set to RESERVED, so another user can borrow it. checkout only fulfills the borrower's own READY reservation with no priority check.
- Blast radius: Waitlists are meaningless; a member who waited weeks can lose the book to a walk-up borrower.
- Fix: Before checkout, if a non-expired READY reservation exists for the book, only that user may borrow (or librarian override with reason). Set copy status RESERVED when promoted to READY; on expiry release it and promote the next queue entry (F-016). Cover with a concurrency integration test.
F-016 Reservation lifecycle stalls: expiry never runs, next-in-line never promoted, queue positions drift
- File: server/src/services/reservationService.ts:141-186, server/src/services/loanService.ts:358-384
- Evidence: processExpiredReservations is dead (F-009). After a READY hold expires, reorderQueue only shifts PENDING positions but nobody promotes the new first member to READY. processNextReservation doesn't notify (No. F-009) or decrement others.
- Blast radius: One missed pickup freezes the queue permanently; queuePosition no longer reflects reality.
- Fix: Scheduled expiry job: mark EXPIRED → release copy → promote lowest-position PENDING to READY with a 3-day expiry → notify → recompute positions in the same transaction. Use row locks and a unique partial index on (book_id, status='ready') to prevent two READY holds per title.
F-017 Fine/payment management is entirely absent; users are blocked with no way to clear fines
- File: server/src/models/Fine.ts, Payment.ts (models exist), no routes/controllers (verified by grep); server/src/services/loanService.ts:58-65,155-162 blocks borrowing when a pending fine exists; README line 12 claims “Automated fine calculation, payment tracking, waiver requests.”
- Evidence: The only UI path is none. FineStatus.PAID, PARTIAL, WAIVED, Payment records, receipts — all unused. Financial report reads tables that nothing writes.
- Blast radius: A member with a $0.50 fine is permanently unable to borrow; librarians must edit the database manually.
- Fix: Build a fines module: GET /fines/my, GET /fines (staff), POST /fines/:id/pay, POST /fines/:id/waive (admin, reason), POST /fines/:id/partial, receipt numbers via Payment, plus member/admin UI. Make accrual idempotent (one “overdue” fine per loan, updated daily) and count pending + partial balances in borrowing checks.
F-018 Admin deleteUser hard-deletes users and their history
- File: server/src/controllers/adminController.ts:210-240
- Evidence: user.destroy() with loans/fines/payments/reviews FKs and no paranoid on any model; no check for active loans.
- Blast radius: Either the delete fails on FK constraints (500) or Cascades wipe circulation and fiscal history; audit trail impossible.
- Fix: Soft delete (paranoid: true on User) or deactivate + anonymize PII on request (GDPR); refuse deletion while active loans exist; keep financial records with a tombstoned user reference.
F-019 Docker images: no .dockerignore, host node_modules copied over npm ci, dev dependencies shipped, root user
- File: Dockerfile.server:8,16, Dockerfile.client:8, no .dockerignore at repo root
- Evidence: Build context is ≈385 MB (client/node_modules 252 MB + server/node_modules 133 MB). COPY server/ ./ after npm ci overwrites container modules with host modules (platform-incompatible risk) and carries .env into the builder layer. Final server stage copies the full node_modules including typescript, eslint, vitest. No USER instruction.
- Blast radius: Slow, non-reproducible builds; secrets in build cache; larger attack surface; containers run as root.
- Fix: Add .dockerignore (node_modules, dist, .env*, logs, test-results, playwright-report, .git); restructure to COPY package*.json → npm ci --omit=dev for the runtime stage (multi-stage with a build stage); USER node; add HEALTHCHECK; never let .env into the context.
F-020 Rate limiting is broken behind nginx
- File: server/src/index.ts:16-38 (no app.set('trust proxy', …)), nginx.conf:17-19 (sets X-Forwarded-For), server/src/middleware/rateLimiter.ts:4-26
- Evidence: With trust proxy disabled, req.ip is the nginx container IP for every user. The general limiter (100/15 min) and auth limiter (10/15 min) become one global bucket.
- Blast radius: A single user can lock out the entire library from logging in (auth DoS); legitimate traffic throttles globally.
- Fix: app.set('trust proxy', 1) (or the exact proxy CIDR) behind nginx; verify via express-rate-limit validation output; key auth limiter by email + IP; consider Redis store for multi-instance deployments.
F-021 numberOfCopies is unbounded → denial of service; barcode conventions are inconsistent
- File: server/src/validators/book.ts:47-50 (min 0, no max), server/src/services/bookService.ts:213-225 (synchronous loop + bulkCreate)
- Evidence: {"numberOfCopies": 500000000} spawns a half-billion-object array in memory. Barcodes are ISBN-001 on create but ISBN-001-abcd on copy addition.
- Blast radius: One librarian (or stolen librarian token) crashes the API process.
- Fix: Cap at a sane max (e.g. 100) in the validator; bulk-insert in chunks; unify barcode generation through generateBarcode() (crypto-random, collision-checked) or a per-book sequence.
F-022 Mass assignment: validators never strip unknown fields
- File: server/src/middleware/validate.ts:5-22, server/src/services/bookService.ts:249-252, server/src/controllers/authController.ts:141-148
- Evidence: validate() only runs chains and throws; req.body keeps every unlisted key. bookService.update spreads the raw body into book.update() (attacker/librarian can set averageRating, totalRatings, even id); updateProfile spreads unvalidated types (numbers into strings).
- Blast radius: Data integrity corruption and the root cause of F-001. Every endpoint is exposed to the same class.
- Fix: In validate(), replace req.body/query/params with matchedData(req, { locations: ['body','query','params'], includeOptionals: true }); explicitly allowlist writable fields per service (pick); never pass req.body to a model.
S2 — Medium
F-023 available=true generates a duplicate Sequelize include alias → SQL error
- File: server/src/services/bookService.ts:47-52,82-89
- Evidence: copies is always included, then included a second time with the same as: 'copies' and required: true. Sequelize emits two joins with alias copies; PostgreSQL rejects it (table name "copies" specified more than once). The path is currently unreachable because of F-013c — two bugs stacked.
- Fix: Single include with conditional where/required; use separate: true or a subquery/EXISTS for availability filtering; add an integration test that actually sends available=true.
F-024 Pagination missing or unbounded across list endpoints
- Files: server/src/controllers/bookController.ts:94,109,163 (limit unbounded), server/src/controllers/adminController.ts:28-29,47 (page/limit unvalidated; Number('abc') → NaN offset), server/src/controllers/notificationController.ts:9-12 (unbounded limit), server/src/services/loanService.ts:329-356 (no pagination), reservationService.ts:118-139, bookRequestService.ts:61-82, loanController.ts:75-103
- Blast radius: ?limit=10000000 memory/DB DoS; lists (loans, reservations, requests) grow unbounded for heavy users.
- Fix: A shared pagination validator (page ≥1, limit 1–100, .toInt()) on every query; findAndCountAll with limit/offset everywhere; cap getPopular/getRecent/openLibrary limits server-side regardless of input.
F-025 JWT verification lacks algorithm pinning, issuer/audience, and token typing
- File: server/src/middleware/auth.ts:26,91 (jwt.verify(token, secret) only), server/src/services/authService.ts:162-176
- Evidence: No { algorithms: ['HS256'], issuer, audience }; access and refresh tokens share a payload shape.
- Fix: Sign with issuer/audience/algorithm; verify with algorithms: ['HS256'], issuer, audience; add a tokenType claim and reject access tokens at the refresh endpoint and vice versa; if secrets are ever equal, this prevents cross-use.
F-026 Password-reset tokens stored in plaintext; verification/reset reissue hygiene
- File: server/src/models/User.ts:133-140, server/src/services/authService.ts:99-128
- Evidence: passwordResetToken/emailVerificationToken are raw hex stored in DB; DB read compromise = account takeover. Old reset tokens remain valid until overwritten.
- Fix: Store SHA-256 hashes; compare hashes; clear all outstanding tokens on password change; single-use enforcement; email only the raw token.
F-027 Email templates interpolate user-controlled values without HTML escaping
- File: server/src/services/emailService.ts:109-199 (${firstName}, ${bookTitle}, ${reason} inside HTML)
- Evidence: A book title like <img src=x onerror=…> or a requester-supplied reason becomes live HTML in every notification email.
- Fix: Escape all interpolations with a small escapeHtml() helper (or use a templating engine with auto-escaping); keep plain-text variants as-is.
F-028 Business policy hardcoded and duplicated; Setting model is dead
- File: server/src/utils/helpers.ts:47-58 (14 days, $0.50/day), server/src/services/loanService.ts:72,96,169,174,310 (max 5 loans, 14-day term), notificationService.ts:199, reportService.ts:207, emailService.ts:165 (fine rate ×4), reservationService.ts:366-367 (3-day hold), models/Setting.ts (never read/written)
- Blast radius: A library cannot change its own policies without a code deployment; values drift between modules.
- Fix: Seed settings (loan.periodDays, loan.maxActive, loan.maxRenewals, fine.perDay, fine.currency, reservation.holdDays); a cached settingsService resolves them; admin UI to edit; all modules consume the service.
F-029 Reviews and ratings are dead infrastructure
- File: server/src/models/Review.ts (no routes/controller; verified by grep), server/src/services/bookService.ts:331-349 (updateRating never called), server/src/services/bookService.ts:114-119 (reviews fetched and silently dropped by the client type)
- Evidence: Book.averageRating is only populated from Open Library during ISBN import. The catalog has no review UI despite BookDetail displaying “reviews”.
- Fix: Reviews module: GET/POST /books/:id/reviews (one per user, purchase/loan-verified optional), moderation flag, recompute averageRating on approve; render on BookDetail.
F-030 AuditLog model is never written to; docs claim audit logging
- File: server/src/models/AuditLog.ts, __docs__/system/architecture.md:199, pen_test_plan.md:73
- Evidence: Zero imports outside models/index.ts.
- Fix: An audit() helper called from service mutations (role changes, book/user/fine/loan changes) with actor, before/after JSON, IP, request ID, in the same transaction where feasible; admin-only query endpoint.
F-031 Multi-library scaffolding is decorative
- File: models/Library.ts, libraryId on User/BookCopy, models/index.ts:35-39; no library CRUD, no scoping
- Evidence: No route or service filters by library; the seed creates one "Main Library"; Library has no controller.
- Fix: Either remove the scaffolding or enforce it: library CRUD, libraryId on loans/reservations, staff scoped to their library, admin cross-library views, copy transfers between branches.
F-032 BookCopy lifecycle statuses are unreachable; no copy management; damage/condition ignored
- File: server/src/types/index.ts:8-15 (RESERVED, MAINTENANCE, LOST, DAMAGED), grep shows none are ever assigned; loanController.ts:42-58 ignores the validated condition field; no /book-copies routes
- Evidence: Only AVAILABLE and BORROWED are ever written. A damaged return silently becomes available again.
- Fix: Copy CRUD (PATCH /book-copies/:id status/condition/location), condition captured at check-in, lost/damaged workflow (copy status + replacement fine), maintenance status, and a per-copy history view.
F-033 Book deletion destroys circulation history
- File: server/src/services/bookService.ts:287-307
- Evidence: Only BORROWED blocks deletion; reservations, returned loans, and fines attached to copies are cascaded/blocked unpredictably; no soft delete.
- Fix: paranoid: true on Book/BookCopy or archive flag; block deletion with any active reservation; restrict to admin; keep history.
F-034 Reports UI is stubbed for endpoints that already exist; CSV export is a dead button
- File: client/src/pages/admin/Reports.tsx:101-103 (ComingSoonReport for circulation/financial/users), :151-154 (Export CSV with no onClick)
- Evidence: Backend /reports/circulation, /users, /financial are implemented and return data; the UI says “coming soon.” The export button is a false affordance.
- Fix: Wire the three views to their endpoints (types already exist in reportService); implement client-side CSV (or a server ?format=csv stream) or remove the button until implemented.
F-035 Native alert/confirm and silent mutation failures
- Files: client/src/pages/MyLoans.tsx:13-16, MyReservations.tsx:11-18, BookManagement.tsx:120,275, UserManagement.tsx:66,232, admin/BookRequestManagement.tsx
- Evidence: BookManagement/UserManagement mutations for create/update/delete/role/status have no onError — failures do nothing visible. Blocking alert/confirm are inaccessible and off-theme.
- Fix: A shared Toast/ConfirmDialog component; an onError default in the QueryClient that surfaces error.response.data.error; extract useApiErrorMessage() (currently every page prints “Request failed with status code 400”).
F-036 Admin workflows require raw UUIDs and have no lookup/pickers
- File: client/src/pages/admin/LoanManagement.tsx:33,202-217, BookRequestManagement.tsx:144-146 (displays request.userId)
- Evidence: “Enter user ID” / “Enter book copy ID” — librarians must paste UUIDs; book requests show UUIDs rather than names despite the backend eager-loading user.
- Fix: Typeahead user picker (GET /admin/users?search=), barcode/ISBN scanner input, and render nested user names/copy barcodes from the API payloads already returned.
F-037 Client architecture is bypassed: admin pages call axios directly and the hook layer is dead
- Files: client/src/hooks/useBooks.ts:34-66 (useCreateBook/useUpdateBook/useDeleteBook unused), useLoans.ts:35-58 (useCheckout/useCheckin unused), useWishlist.ts:42-64 (priority/notes hooks unused), vs BookManagement.tsx:4, UserManagement.tsx:4, LoanManagement.tsx:4 using api directly
- Evidence: Grep confirms zero imports of those hooks outside hooks/index.ts.
- Fix: Pick one data-access pattern. Move the admin queries into hooks/ (or a feature folder) and delete the dead ones; never call api from page components.
F-038 Design tokens exist but are bypassed; three competing palettes
- Files: client/src/index.css:3-12 (parchment tokens), yet BookCard.tsx:18,35,41,53 (white/green/blue/yellow), Home.tsx:13,25,43,45,48, Login.tsx:37-42, NotFound.tsx:9-11, MyLoans.tsx:25-93 (gray-scale), success/error #22c55e/#ef4444 hardcoded in 6 files, Input.tsx:26,33 (#b91c1c), Button.tsx:23-27 (danger renders gray)
- Blast radius: Branding changes require grep-and-replace across 20+ files; pages look like different products.
- Fix: Extend tokens (--color-success, --color-danger, --color-surface, --color-text…) and Tailwind v4 @theme; move inline style objects into component classes; make danger red; enforce with a lint rule banning raw hex in JSX.
F-039 Accessibility gaps throughout
- Files: icon-only buttons without labels (BookManagement.tsx:266-283, UserManagement.tsx:222-240, MyWishlist.tsx:108-115, Header.tsx:103-108,130-133, NotificationDropdown.tsx:49-58,110-127); hover-only admin menu (Header.tsx:54-99 — unusable by keyboard/touch); status communicated by color only (MyLoans.tsx:84-96, notification badges); modals lack focus traps/role="dialog".
- Fix: aria-label on every icon button, dropdown click/keyboard toggle with aria-expanded, text/icon pairing for status, focus management in modals, run Lighthouse/a11y CI.
F-040 Search inputs fire a request per keystroke
- File: client/src/pages/admin/BookManagement.tsx:189, client/src/pages/admin/UserManagement.tsx:118 (query key includes search directly)
- Fix: useDebounce(value, 300) or useDeferredValue.
F-041 Repository hygiene: agent logs were tracked, an ignore rule invites recommitting them, last commit message is pasted git status
- Files: .gitignore:30 (!logs/agent.log), git history (a6186b7, 0ef0365, 60c145e, 6ac271b modify logs/agent.log; d20a549 message = “On branch main / Changes to be committed: deleted: logs/agent.log”), tracked test-results/.last-run.json
- Fix: Remove the !logs/agent.log exception and ignore logs/ wholesale; stop tracking test-results/ and playwright-report/; if the agent log is required, move it to __docs__/ with a proper name. Optionally rewrite history to purge log commits.
F-042 Live secrets sit in server/.env (including a Gmail app password) and are inside the Docker build context
- File: server/.env (DB_PASSWORD=12251299, real 128-hex JWT secrets, SMTP_PASS=kjvflgbcajidralz), Dockerfile.server:8 (COPY server/ ./), no .dockerignore
- Evidence: Confirmed untracked and not in git history — good — but plaintext on disk and swept into the build context/layer. We also observed SMTP host/secure misconfiguration (F-010).
- Fix: Rotate the DB password, both JWT secrets, and the Gmail app password now; keep .env only locally; add .env to .dockerignore; ensure deploy injects secrets.
F-043 docker-compose.yml deployment weaknesses
- File: docker-compose.yml:8 (default library_secure_password), :11-12 (Postgres 5432 published to host), :53-54 (client only, no server healthcheck), no volumes for logs/uploads
- Fix: Remove the default password and use ${DB_PASSWORD:?}; do not publish 5432 (compose network only); add server healthcheck and client depends_on: condition: service_healthy; add volumes for uploads and logs; set restart and resource limits.
F-044 No error boundaries or global API-error UX
- Files: client/src/main.tsx (no ErrorBoundary), every page's catch prints generic axios messages
- Fix: Add a root + route-level ErrorBoundary; a getErrorMessage(error) helper that reads error.response?.data?.error; toast integration (F-035).
F-045 Admin endpoints lack validation
- File: server/src/routes/admin.ts (no validate() anywhere), server/src/controllers/adminController.ts:64-112,136-208
- Evidence: createUser accepts any password (no complexity) and any role (DB ENUM 500 on garbage); updateUserStatus accepts isActive: "yes" (string truthiness into a boolean column); listUsers pagination unvalidated.
- Fix: Add express-validator chains (reuse password rules), isIn(Object.values(UserRole)), isBoolean(), pagination rules.
F-046 Book-request processing is unvalidated; status semantics are wrong
- Files: server/src/routes/bookRequests.ts:8-45 (no validators), server/src/services/bookRequestService.ts:132-150 (cancel writes status: REJECTED with adminNotes: 'Cancelled by user'), BookRequestStatus has no CANCELLED
- Fix: Validate status ∈ {approved, rejected, acquired} and adminNotes length; add CANCELLED to the enum; don't repurpose admin notes for user actions; hide adminNotes from the requester view or expose intentionally.
F-047 PUT /books/:id is a partial update with silent copy-count drift
- File: server/src/services/bookService.ts:232-285
- Evidence: All validator fields optional (PUT semantics violated); when targetCount < currentCount and not enough copies are AVAILABLE, the removal silently does nothing while the API reports success.
- Fix: Make it PATCH (or enforce full-body on PUT); return the resulting copy count; throw ConflictError when requested count can't be satisfied; add copy-level management endpoints instead of count math (F-032).
S3 — Low
F-048 Dead code and unused/missing dependencies
- Files/evidence: unused exports generateRequestId, sanitizeString, isValidISBN, updateProfileValidator, loanIdValidator, reservationSearchValidator; unused hooks useCreateBook/useUpdateBook/useDeleteBook/useCheckout/useCheckin/useUpdateWishlistPriority/useUpdateWishlistNotes/useProfile/useChangePassword; unused dependencies zod (never imported), multer (no upload endpoints despite config/UPLOAD_DIR); missing devDependencies sequelize-cli, @playwright/test; ts-node used by npm run seed but only transitively provided.
- Fix: Delete dead exports/hooks or wire them; remove zod/multer (or implement uploads with multer); declare all used tools explicitly; add knip/ts-prune to CI.
F-049 Empty directories and stale scripts
- Evidence: root src/ empty; __tests__/unit, __tests__/integration, __tests__/security empty; database/migrations, database/seeds empty; server/package.json:15 test:integration targets a nonexistent path.
- Fix: Delete empty dirs or populate them; point scripts at real paths.
F-050 Node/runtime version drift
- Evidence: engines: ">=18" but uuid@13 is ESM-first, @types/node@25, Docker node:22-alpine, CI node:22; no .nvmrc/.node-version.
- Fix: Set engines: ">=22", add .nvmrc, add engine-strict=true; or pin a CJS-compatible uuid major.
F-051 Seed script is destructive and ships default credentials
- File: server/scripts/seed.ts:8 (sync({force:true})), :25-63 (Admin123! etc.), :234-243 (Math.random() barcodes)
- Fix: Guard with NODE_ENV !== 'production' and an explicit --force flag; generate random admin password printed once, or require env; use collision-safe barcodes and findOrCreate for idempotency.
F-052 Types duplicated between client and server; no shared package
- Files: client/src/types/index.ts vs server/src/types/index.ts (enums/entities) — divergence risk (e.g., Book client lacks reviews, server BookCopy.condition differs from client union).
- Fix: A packages/shared (or server/src/types imported via workspace) owning enums and DTOs; generate API types from an OpenAPI spec (F-059).
F-053 No route-level code splitting; production source maps
- Files: client/src/App.tsx (all pages statically imported), client/vite.config.ts:22-25 (sourcemap: true), built dist/assets/*.js.map served.
- Fix: React.lazy + Suspense per route; sourcemap: 'hidden' and upload maps to error tracking only.
F-054 Navigation gaps
- File: client/src/components/Header.tsx (no links to Wishlist, Book Requests, Profile; /admin/book-requests unreachable from the admin menu despite the route existing).
- Fix: Add member links and the admin Book Requests entry; derive nav items from a config array.
F-055 HTTP/API inconsistencies
- Evidence: PUT used for partial updates (F-047); error shape varies — notFoundHandler adds message, controllers use error; 404 vs 200 with success:false mixed (bookController.lookupIsbn uses both patterns inside one method).
- Fix: Standardize an ApiError envelope and status codes; document in OpenAPI.
F-056 Logging: PII, duplicate request logs, no redaction
- Files: server/src/services/authService.ts:51,75 (logs email), server/src/middleware/requestLogger.ts:19-21 (IP/UA), server/src/index.ts:32 (morgan) + custom logger (double logging).
- Fix: Log user IDs not emails; redact sensitive fields; drop morgan or the custom logger; add log retention policy.
F-057 Fine math overcharges partial days and statuses PARTIAL/PAID are never produced
- File: server/src/utils/helpers.ts:53-58 (Math.ceil).
- Fix: Decide policy explicitly (per-started-day vs. per-24h) and centralize; wire payment statuses with F-017.
F-058 Data/UX consistency leftovers
- Evidence: language codes mixed (Book.language default 'English' vs bookService 'en'; filter options hardcode English names); Home/BookCard/LoadingSpinner still use raw Tailwind colors; Footer links href="#".
- Fix: Standardize ISO-639-1 codes + display map; finish token migration; point or remove dead footer links.
F-059 No API specification; docs overstate reality
- Files: no OpenAPI/Swagger; README.md:123-148 lists only a subset of routes; __docs__/system/architecture.md:188 claims Zod validation (unused), :199 audit logging (absent), pen_test_plan.md marks refresh rotation, CSRF tokens, CSP as present/planned contradictorily.
- Fix: Generate OpenAPI from validators or hand-write it and serve Swagger UI; update docs to match implementation; make doc claims part of PR review.
F-060 nginx is not hardened
- File: nginx.conf — no server_tokens off, no security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy), no client_max_body_size, no API rate limiting, no proxy timeouts.
- Fix: Add headers at the edge, align client_max_body_size with the 10 MB body limit, add limit_req as a second layer, server_tokens off.
F-061 Wishlist inputs unvalidated and priority feature unused
- Files: server/src/routes/wishlist.ts (no validators), wishlistService.ts:88-112 (priority any value, notes unbounded), client/src/pages/MyWishlist.tsx (no priority UI/notes editing despite hooks).
- Fix: Validate priority int range and notes max length; either surface priority/notes in the UI or drop the fields.
F-062 Profile endpoint leaks reset metadata; login return type is a lie
- Files: server/src/controllers/authController.ts:111-124 (returns full user incl. passwordResetExpires, lastLoginAt), server/src/services/authService.ts:25-29 (LoginResult.user: Omit<User,'password'> but a full model instance is returned).
- Fix: Return an explicit UserDto projection everywhere (id, email, names, role, flags, createdAt); never serialize models directly.
F-063 UUIDv4 primary keys and Math.random() barcodes
- Evidence: 17 models use UUIDV4 PKs (random insert locality, index bloat at scale); generateBarcode uses Math.random().
- Fix: Use UUIDv7/ULID for sortable PKs when volume grows; crypto.randomUUID()/randomBytes for barcodes.
F-064 bookRequestService.cancel semantics and admin-note exposure
- File: server/src/services/bookRequestService.ts:132-150 + client/src/pages/MyBookRequests.tsx:218-222 (renders adminNotes to the requester)
- Fix: Add a cancelled status, store the user reason separately, and mark admin notes internal if they should not be shown.
Cross-File Dependency Map (S0/S1)
Origin	Smell	Affected Files
server/src/services/authService.ts:47	Client-controlled role	controllers/authController.ts, every protected route, adminController.ts, all admin UI
server/src/config/index.ts:93	Secret defaults	middleware/auth.ts, services/authService.ts, docker-compose.yml, all deployments
server/src/middleware/auth.ts:79	No rotation/revocation	authService.ts, client/src/services/api.ts, client/src/store/authStore.ts
server/src/services/bookService.ts:47-96	Broken search/filter/order	bookController.ts, validators/book.ts, client Books.tsx, Home.tsx, BookManagement.tsx
server/src/services/loanService.ts:28-384	Queue bypass + dead expiry/notify	reservationService.ts, notificationService.ts, emailService.ts, MyReservations.tsx, BookDetail.tsx
server/src/models/Fine.ts/Payment.ts	Models with no API	reportService.ts, AdminDashboard.tsx, Reports.tsx, loan borrowing checks
server/src/services/emailService.ts	Never-called methods	authService.ts, Login.tsx (dead link), App.tsx (missing routes)
server/src/models/AuditLog.ts/Setting.ts	Dead models	models/index.ts, docs claiming audit/policy support
playwright.config.ts	Orphaned test runner	__tests__/**, CI, test-results/, missing root package
Dockerfile* + missing .dockerignore	Build hygiene	docker-compose.yml, server/.env, client/node_modules
Remediation Priority Order
1. Rotate every secret in server/.env (DB password, both JWT secrets, Gmail app password) and remove config fallbacks (F-002, F-042).
2. Fix registration role escalation and strip unknown fields in validate() (F-001, F-022).
3. Token hardening: HttpOnly refresh cookie, rotation + revocation, logout endpoint, invalidate on password change (F-003, F-004).
4. Repair quality gates: flat ESLint configs, root workspace/Playwright, migrations + sequelize-cli, service integration tests in CI (F-005–F-008).
5. Fix production-breaking contracts: barcode checkout, category/available/author filters, sortBy whitelist (F-012–F-014).
6. Make reservations and notifications actually work: scheduler + expiry/promotion + notify (F-009, F-015, F-016).
7. Build the missing fines module and unblock borrowers (F-017).
8. Harden deployment: .dockerignore, non-root, prod-only deps, trust proxy, compose secrets/network, nginx headers (F-019, F-020, F-043, F-060).
9. Add jobs/tests/guards for the medium findings (S2), then cleanup (S3).
Missing Features for a Library Management System
A. Scaffolded but not wired (models/partial code already exist — cheapest wins)
Feature	Current state	Suggested implementation
Fine & payment management	Fine, Payment models; no routes/UI; only loanService.checkin creates a fine	CRUD + pay/waive/partial endpoints, receipts, accrual job, member/admin UI (F-017)
Reviews & ratings	Review model; updateRating dead; no routes	Review CRUD + moderation + rating recompute + BookDetail UI (F-029)
Audit trail	AuditLog model never written	Middleware/service audit helper, admin query UI (F-030)
System settings	Setting model unused	Settings service + admin panel; drive loan/fine/hold policy (F-028)
Multi-branch libraries	Library model, libraryId columns unused	Library CRUD, scoping, transfers, per-branch reporting (F-031)
Notifications automation	Services exist, never scheduled	Cron/queue jobs for due/overdue/hold-ready/fine notices (F-009)
Email verification / password reset	Backend half-implemented; UI pages absent	Forgot/Reset/Verify pages + wire emailService (F-010, F-011)
B. Absent — core library operations
1. Copy-level management & barcode workflow — per-copy add/edit/withdraw, status transitions (RESERVED, MAINTENANCE, LOST, DAMAGED), condition capture at return, barcode/ISBN scanner endpoints (F-014, F-032).
2. Lost/damaged book workflow — replacement cost, fine creation, write-off approval, borrower history flags.
3. Holdshelf / pickup management — hold-ready shelf list, expiry, pickup confirmation.
4. Acquisitions — book requests → approval → vendor/purchase order → budget tracking → receiving into copies.
5. Interlibrary loans — lending/borrowing to partner libraries with due-date handling.
6. Inventory / stock audit — shelf-list sessions, scan-to-verify, discrepancy report.
7. Member management — membership numbers/cards, borrower categories (student/staff/adult) with different loan limits, expiry/renewal, bulk import.
8. Calendar-aware circulation — closed days/holidays adjust due dates; lost days accrual.
9. Automated backups & retention — DB + upload backups, restore procedure, retention policy.
C. Absent — platform, security, and UX
10. MFA/2FA, account lockout, trusted-device/session list, "sign out everywhere" (F-003).
11. GDPR/data portability — self-service export, deletion/anonymization workflow (F-018).
12. Reporting exports — CSV/PDF, scheduled emailed reports (F-034).
13. Full-text & faceted search — Postgres tsvector, author/publisher/subject facets, availability sorting (F-013).
14. Wishlist automation — priority queue that auto-reserves/notifies when a title becomes available (F-061).
15. Recommendations — related titles by author/category/co-borrow.
16. Accessibility & i18n — WCAG 2.1 AA pass, keyboard navigation, locale/translation framework (F-039).
17. API platform — OpenAPI + Swagger UI, API keys for self-service kiosks, webhooks (F-059).
18. Observability — structured logs with redaction, metrics (Prometheus), health/readiness endpoints separated, error tracking (F-056).
19. Push/SMS notifications and per-user notification preferences.
20. Mobile-first member experience — PWA, offline catalog, barcode scan from phone.
Automated Tool Recommendations
Tool	Purpose	Command
eslint (flat config)	Restore lint gate	npx eslint . after eslint.config.mjs
ts-prune / knip	Dead exports/files (F-048)	npx knip
depcheck	Unused deps (zod, multer)	npx depcheck
npm audit	Known CVEs	npm audit --audit-level=high (make blocking)
secretlint	Prevent secret commits	npx secretlint "**/*"
madge	Circular dependency check	npx madge --circular --extensions ts server/src client/src
npm pack --dry-run	Publish hygiene (if SDK/pkg later)	npm pack --dry-run
playwright	E2E/API suite (F-006)	root npm run test:e2e
vitest --coverage	Threshold gate (F-007)	npm run test:coverage
lighthouse / axe	A11y gate (F-039)	Lighthouse CI on built client
Audit Completion Checklist
- Every file in scope read in full (118 source/config/doc/test files)
- Every S0 finding has a blast radius and remediation
- Every S1 finding has a remediation plan
- Import/trace walk performed for God files, dead models, and orphaned services
- .gitignore checked against committed artifacts (agent.log history, test-results tracked)
- Secret scan executed: no committed secrets at HEAD; live secrets found on disk in server/.env (rotate)
- dependencies vs devDependencies audited (missing sequelize-cli, @playwright/test; unused zod, multer)
- All route handlers checked for auth/validation (gaps: admin, book-requests, wishlist, profile, self-checkout)
- All async paths checked for unhandled rejections (Express 5 handles sync throws; client refresh race found)
- Remediation order sorted by impact
Bottom line: the layering (routes → controllers → services → models) and transactional discipline in loan/reservation flows are structurally sound, and both TypeScript builds are clean. Everything else — auth hardening, test/CI integrity, migrations, notification jobs, fines, reviews, audit, deployment hygiene — is either broken, dead, or missing. Fix the three S0 items before the next deployment; they are exploitable today.
