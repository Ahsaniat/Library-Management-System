# Library Management System

A self-hostable library platform for cataloging, circulation, members, reservations, fines and reporting — built to be forked and shaped to how a real library works.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js_22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

---

## What it does

**Circulation that respects the queue.** Checkout refuses a title that is on hold for another member — with a staff override for exceptions — and every return promotes the next person in line, or releases the hold when it expires.

**A desk that works at scanning speed.** Staff check books in and out by barcode (or copy UUID), search borrowers by name or email instead of pasting IDs, and record the condition of every returned item. Damaged returns move to maintenance instead of silently going back on the shelf.

**Fines you can actually collect.** Overdue returns generate fines automatically using the configured daily rate; members see their balance, staff record partial or full payments with receipt numbers, and admins waive with a reason. Borrowing is blocked on outstanding balances and clears the moment they are paid.

**Policies as settings, not deployments.** Loan period, active-loan and renewal limits, the fine rate, the fine currency (USD `$`, BDT `৳`, EUR, GBP, INR) and reservation hold duration are all editable from the admin UI.

**Reviews from real readers.** Members who borrowed and returned a title can review it once; ratings recalculate transactionally and render on the book page.

**An audit trail with a memory.** Role changes, deletions, checkouts, payments, waivers and session events are recorded with actor, before/after values, IP and request ID.

## Screenshots

| | |
|---|---|
| ![Landing page](__docs__/screenshots/01-home.png) | ![Catalog with filters](__docs__/screenshots/03-catalog-filters.png) |
| **Landing page** | **Catalog with category, language and sort filters** |
| ![Book detail](__docs__/screenshots/04-book-detail.png) | ![Member dashboard](__docs__/screenshots/05-dashboard.png) |
| **Book detail with reviews and availability** | **Member dashboard — stat cards link to their screens** |
| ![Checkout by barcode](__docs__/screenshots/08-checkout-modal.png) | ![Return with condition](__docs__/screenshots/09-return-modal.png) |
| **Desk checkout: scan a barcode, search the borrower** | **Return: capture the item condition** |
| ![Loan management](__docs__/screenshots/10-loan-management.png) | ![Fine management](__docs__/screenshots/15-fine-waived.png) |
| **Overdue loans with borrower and fine context** | **Fine payment and waiver management** |
| ![Financial report](__docs__/screenshots/16-reports.png) | ![System settings](__docs__/screenshots/17-settings.png) |
| **Reports with CSV export** | **Policy settings (loan period, fine rate, holds)** |
| ![User management](__docs__/screenshots/18-users.png) | ![Book management](__docs__/screenshots/19-books.png) |
| **User management** | **Book management with Open Library import** |

## Quick start

### Prerequisites

| Requirement | Version | Why |
| :--- | :--- | :--- |
| Node.js | `>= 22` | Enforced by `engines`; required by the test runner and modern dependencies |
| PostgreSQL | `>= 14` | JSONB audit payloads and enum migrations |
| npm | `>= 10` | Lockfile version used in the repo |

### Run it locally

```bash
# 1. Clone the repository
git clone https://github.com/Ahsaniat/Library-Management-System.git
cd Library-Management-System

# 2. Configure the API (JWT secrets must be 64+ chars; generate them, don't invent them)
cp .env.example server/.env
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"   # JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"   # JWT_REFRESH_SECRET

# 3. Install dependencies: API, web client and the Playwright test runner
(cd server && npm install)
(cd client && npm install)
npm install

# 4. Create the schema and install policy defaults
psql -U postgres -c "CREATE DATABASE library_db;"
(cd server && npm run db:migrate && npm run db:seed)

# 5. Optional: demo catalog, members and circulation data
(cd server && npm run seed)

# 6. Run both dev servers (separate terminals)
(cd server && npm run dev)   # API  → http://localhost:3001/api/v1
(cd client && npm run dev)   # Web  → http://localhost:5173
```

The demo seed prints its own credentials: `admin@library.local`, `librarian@library.local` and `member@library.local`, with the password pattern `<Role>123!`.

## Configuration

Copy [`.env.example`](.env.example) to `server/.env` and adjust. Secrets are validated at boot — the server refuses to start with missing or placeholder values.

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | `string` | `development` | Enables production behaviour such as secure cookies and email-verification enforcement. |
| `PORT` | `int` | `3001` | API port. |
| `DB_HOST` | `string` | `localhost` | PostgreSQL host. |
| `DB_PORT` | `int` | `5432` | PostgreSQL port. |
| `DB_NAME` | `string` | `library_db` | Database name. |
| `DB_USER` | `string` | `postgres` | Database user. |
| `DB_PASSWORD` | `string` | — | **Required.** Database password. |
| `DB_POOL_MIN` / `DB_POOL_MAX` | `int` | `2` / `10` | Connection pool bounds. |
| `JWT_SECRET` | `string` | — | **Required, 64+ chars.** Access-token signing key. |
| `JWT_EXPIRES_IN` | `duration` | `15m` | Access-token lifetime. |
| `JWT_REFRESH_SECRET` | `string` | — | **Required, 64+ chars.** Refresh-token signing key. |
| `JWT_REFRESH_EXPIRES_IN` | `duration` | `7d` | Refresh-token lifetime. |
| `SMTP_HOST` / `SMTP_PORT` | `string` / `int` | `smtp.gmail.com` / `587` | SMTP relay; use STARTTLS with `SMTP_SECURE=false` on 587. |
| `SMTP_USER` / `SMTP_PASS` | `string` | — | Gmail address and 16-character app password. |
| `CORS_ORIGIN` | `url` | `http://localhost:5173` | Allowed browser origin. |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX_REQUESTS` | `int` | `900000` / `100` | Global rate limit window and budget. |
| `LOG_LEVEL` | `string` | `info` | Winston log level; credentials are redacted automatically. |
| `JOBS_ENABLED` | `bool` | `true` | Reminders, overdue notices, hold expiry and token cleanup. Disable on all but one instance when scaling out. |
| `REQUIRE_EMAIL_VERIFICATION` | `bool` | `false` (`true` in production) | Reject logins until the email is verified. |
| `TRUST_PROXY` | `int` \| `false` | `1` | Trusted reverse-proxy hops; required for correct client IPs and rate limiting behind nginx. |
| `OPEN_LIBRARY_API_URL` | `url` | `https://openlibrary.org` | ISBN lookup provider. |
| `UPLOAD_DIR` / `MAX_FILE_SIZE` | `path` / `bytes` | `./uploads` / `5242880` | Upload location and size cap. |

## API

Every endpoint, parameter and access rule lives in the full reference: **[`__docs__/api/endpoints.md`](__docs__/api/endpoints.md)**.

| Method | Endpoint | Purpose | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` · `/auth/refresh-token` · `/auth/logout` | Session lifecycle; refresh tokens live in HttpOnly cookies | Public |
| `GET` | `/books` | Search, filter and sort the catalog | Public |
| `POST` | `/loans/checkout` · `/loans/checkin` | Circulation by barcode or copy UUID | Staff |
| `POST` | `/reservations` | Join the waitlist and get promoted automatically | Member |
| `GET` `POST` | `/fines/my` · `/fines/:id/pay` · `/fines/:id/waive` | Balances, receipts and waivers | Member / Staff / Admin |
| `GET` `PATCH` | `/book-copies` | Per-copy status, condition and location | Staff |
| `GET` `PUT` | `/reports/*` · `/settings` | Statistics, CSV export and policy configuration | Staff / Admin |

<details>
<summary><b>Response conventions and pagination</b></summary>

List endpoints return `{ success, data: { <items>, pagination } }` with `limit` capped at 100. Errors share one envelope:

```json
{ "success": false, "error": "Human-readable message", "code": "VALIDATION_ERROR", "requestId": "…" }
```

Authenticated requests use `Authorization: Bearer <accessToken>`; the refresh token never leaves its HttpOnly cookie for browser clients. Non-browser clients can request it in the body with the `X-Refresh-Token-Transport: body` header.

</details>

## Testing

```bash
# Unit tests with a coverage gate (server)
cd server && npm run test:coverage

# API acceptance suite — starts API + web, needs a running PostgreSQL
npm run test:api

# Browser end-to-end tests
npm run test:e2e

# Static checks used by CI
(cd server && npm run lint && npm run build)
(cd client && npm run lint && npm run build)
```

## Docker

Migrations run automatically in a one-shot `migrate` service before the API starts; the API image runs as the `node` user with production dependencies only.

```bash
# 1. Export the required secrets (compose refuses to start without them)
export DB_PASSWORD="$(openssl rand -hex 16)"
export JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"
export JWT_REFRESH_SECRET="$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"

# 2. Build and start the stack (Postgres, migrations, API, nginx)
docker compose up -d --build

# 3. Open the app
#    Web → http://localhost        API → http://localhost:3001/api/v1
```

## Project structure

<details>
<summary><b>Expand the directory map</b></summary>

```
Library-Management-System/
├── client/                     # React + Vite web client (lazy routes, TanStack Query, Zustand)
│   └── src/{components,hooks,pages,services,store,types,utils}
├── server/                     # Express API
│   ├── src/
│   │   ├── config/             # Environment loading and Sequelize setup
│   │   ├── controllers/        # HTTP layer
│   │   ├── middleware/         # Auth, validation, rate limiting, errors
│   │   ├── models/             # Sequelize models and associations
│   │   ├── routes/             # API routing
│   │   ├── services/           # Business logic (loans, reservations, fines, audit)
│   │   └── validators/         # express-validator chains
│   └── tests/                  # Vitest unit tests
├── database/                   # Versioned migrations and seeders
├── __tests__/                  # Playwright API and browser suites
├── __docs__/                   # API reference and screenshots
├── nginx.conf                  # Reverse proxy for the production image
└── docker-compose.yml          # Postgres + migrate + API + client
```

</details>

## Security

Authentication uses short-lived access tokens and rotating refresh tokens with reuse detection; password changes, deactivation and deletion revoke every active session. Passwords are hashed with bcrypt (12 rounds), all write routes strip unknown fields through `matchedData` allowlists, and one-time tokens are stored as SHA-256 hashes. The API ships with Helmet headers, per-route rate limiting keyed on the real client IP, parameterized queries via Sequelize, and structured logs that redact credentials and PII.

## Contributing

1. Fork the repository and create a branch: `git checkout -b feature/amazing-feature`
2. Make your change, keeping commits atomic and the test suite green
3. Run `npm run lint` in both workspaces plus `npm run test:api`
4. Push the branch and open a Pull Request describing the behaviour change

## License

MIT License — see [LICENSE](LICENSE) for details.
