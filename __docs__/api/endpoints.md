# API Endpoint Reference

Base URL: `/api/v1`. Authenticated routes expect `Authorization: Bearer <accessToken>`.
The refresh token travels in an HttpOnly cookie named `refreshToken`.

## Auth

| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/auth/register` | public | Creates a MEMBER account, sends verification email |
| POST | `/auth/login` | public | Sets refresh cookie; returns access token + user DTO |
| POST | `/auth/refresh-token` | cookie | Rotates the refresh token |
| POST | `/auth/logout` | cookie | Revokes the presented refresh token |
| GET | `/auth/verify-email/:token` | public | Token expires after 24h |
| POST | `/auth/forgot-password` | public | Sends reset email |
| POST | `/auth/reset-password` | public | Token expires after 1h |
| GET | `/auth/profile` | member | |
| PATCH | `/auth/profile` | member | firstName, lastName, phone, address |
| POST | `/auth/change-password` | member | Revokes all sessions |

## Catalog

| Method | Path | Access |
|---|---|---|
| GET | `/books` | public (q, category, author, publisher, year, language, available, sortBy, sortOrder, page, limit) |
| GET | `/books/popular` · `/books/recent` | public |
| GET | `/books/categories` | public |
| GET | `/books/isbn/:isbn` | public (database then Open Library) |
| GET | `/books/openlibrary/search` | public |
| GET | `/books/:id` | public |
| POST | `/books` | admin/librarian |
| PATCH | `/books/:id` | admin/librarian |
| DELETE | `/books/:id` | admin (soft delete) |
| GET | `/books/:id/reviews` | public |
| POST | `/books/:id/reviews` | member who returned the title |
| DELETE | `/reviews/:id` | owner or admin |

## Circulation

| Method | Path | Access |
|---|---|---|
| POST | `/loans/self-checkout` | member |
| POST | `/loans/checkout` | admin/librarian (accepts `barcode` or `bookCopyId`, `overrideHold`) |
| POST | `/loans/checkin` | admin/librarian (accepts `barcode` or `bookCopyId`, `condition`) |
| POST | `/loans/:loanId/renew` | member |
| GET | `/loans/my` · `/loans/user/:userId` · `/loans/overdue` | paginated |
| POST | `/reservations` · `/:id/cancel` | member |
| GET | `/reservations/my` · `/reservations/book/:bookId` | paginated |

## Fines

| Method | Path | Access |
|---|---|---|
| GET | `/fines/my` | member (paginated) |
| GET | `/fines/summary/my` | member outstanding balance |
| GET | `/fines` | admin/librarian (status, userId filters) |
| POST | `/fines/:id/pay` | admin/librarian (amount, method) |
| POST | `/fines/:id/waive` | admin (reason) |

## Inventory & branches

| Method | Path | Access |
|---|---|---|
| GET | `/book-copies?bookId=` | admin/librarian |
| POST | `/book-copies` | admin/librarian (auto barcode if omitted) |
| PATCH | `/book-copies/:id` | admin/librarian (status, condition, location) |
| DELETE | `/book-copies/:id` | admin |
| GET | `/libraries` · `/libraries/:id` | public |
| POST/PATCH/DELETE | `/libraries` | admin |

## Requests, wishlist, notifications

| Method | Path | Access |
|---|---|---|
| POST/GET | `/book-requests` · `/book-requests/my` | member |
| POST | `/book-requests/:id/cancel` | member |
| POST | `/book-requests/:id/process` | admin/librarian |
| POST/GET | `/wishlist` · `/wishlist/my` | member |
| GET | `/wishlist/check/:bookId` | member |
| DELETE | `/wishlist/:bookId` | member |
| PATCH | `/wishlist/:bookId/priority` · `/notes` | member |
| GET | `/notifications` | member (unreadOnly, limit, offset) |
| POST | `/notifications/:id/read` · `/notifications/mark-all-read` | member |
| DELETE | `/notifications/:id` | member |

## Admin, settings and reports

| Method | Path | Access |
|---|---|---|
| GET/POST | `/admin/users` | admin |
| GET | `/admin/users/:id` | admin |
| PATCH | `/admin/users/:id/role` · `/status` | admin |
| DELETE | `/admin/users/:id` | admin (soft delete, blocked with active loans) |
| GET | `/settings/public` | public |
| GET/PUT | `/settings` | admin |
| GET | `/reports/dashboard` · `/circulation` · `/books` · `/overdue` · `/inventory` | admin/librarian |
| GET | `/reports/users` · `/financial` | admin |

## Conventions

- List endpoints return `{ data: { <items>, pagination } }`; `limit` is capped at 100.
- Errors: `{ success: false, error: string, code?: string, requestId }`.
- Money values are decimal numbers; fines charge per started day.
