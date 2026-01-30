# Library Management System - Database Design

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Library   │       │    User     │       │   Author    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ name        │       │ email       │       │ name        │
│ code        │       │ password    │       │ biography   │
│ address     │◄──┐   │ firstName   │       │ birthDate   │
│ city        │   │   │ lastName    │       │ nationality │
│ isMain      │   │   │ role        │       │ photo       │
│ isActive    │   │   │ libraryId   │───────┘             │
└─────────────┘   │   │ isActive    │       └─────────────┘
                  │   └─────────────┘               │
                  │          │                      │
                  │          │                      │
                  │   ┌──────┴──────┐               │
                  │   │             │               │
┌─────────────┐   │   ▼             ▼      ┌───────▼─────┐
│  Publisher  │   │ ┌─────────┐ ┌─────────┐│    Book     │
├─────────────┤   │ │  Loan   │ │Reservation├─────────────┤
│ id (PK)     │   │ ├─────────┤ ├─────────┤│ id (PK)     │
│ name        │   │ │ id (PK) │ │ id (PK) ││ isbn        │
│ address     │   │ │bookCopyId│ │ bookId  ││ title       │
│ email       │   │ │ userId  │ │ userId  ││ description │
│ website     │   │ │ status  │ │ status  ││ authorId    │──┘
└─────────────┘   │ │ dueDate │ │queuePos ││ publisherId │
      │           │ │returnedAt│ │expiresAt││ categoryId  │
      │           │ └─────────┘ └─────────┘│ avgRating   │
      │           │      │                 └─────────────┘
      │           │      │                        │
      │           │      ▼                        │
      │           │ ┌─────────┐           ┌───────▼─────┐
      │           │ │  Fine   │           │  BookCopy   │
      │           │ ├─────────┤           ├─────────────┤
      │           │ │ id (PK) │           │ id (PK)     │
      │           │ │ loanId  │───────────│ bookId      │
      │           │ │ userId  │           │ barcode     │
      │           │ │ amount  │           │ status      │
      │           │ │ status  │           │ condition   │
      └───────────┼─│ paidAt  │           │ libraryId   │──┐
                  │ └─────────┘           │ location    │  │
                  │      │                └─────────────┘  │
                  │      ▼                                 │
                  │ ┌─────────┐       ┌─────────────┐      │
                  │ │ Payment │       │  Category   │      │
                  │ ├─────────┤       ├─────────────┤      │
                  │ │ id (PK) │       │ id (PK)     │      │
                  │ │ fineId  │       │ name        │      │
                  │ │ userId  │       │ description │      │
                  │ │ amount  │       │ parentId    │──┐   │
                  │ │ method  │       └─────────────┘  │   │
                  │ │receiptNo│              │         │   │
                  │ └─────────┘              └─────────┘   │
                  │                                        │
                  └────────────────────────────────────────┘

Additional Tables:
- Review (bookId, userId, rating, content)
- Notification (userId, type, title, message)
- AuditLog (userId, action, entityType, entityId)
- Setting (key, value, type)
```

## Table Relationships

### One-to-Many
- Library → Users (library has many users)
- Library → BookCopies (library has many book copies)
- Author → Books (author has many books)
- Category → Books (category has many books)
- Category → Categories (category has subcategories)
- Publisher → Books (publisher has many books)
- Book → BookCopies (book has many copies)
- Book → Reviews (book has many reviews)
- Book → Reservations (book has many reservations)
- User → Loans (user has many loans)
- User → Reservations (user has many reservations)
- User → Fines (user has many fines)
- User → Reviews (user has many reviews)
- User → Notifications (user has many notifications)
- BookCopy → Loans (book copy has many loans)
- Loan → Fines (loan has many fines)
- Fine → Payments (fine has many payments)

## Indexes

### Primary Indexes
All tables have UUID primary keys with automatic indexing.

### Secondary Indexes
- users: email (unique), role, is_active, library_id
- books: isbn (unique), title, author_id, category_id, published_year
- book_copies: barcode (unique), book_id, status, library_id
- loans: book_copy_id, user_id, status, due_date, borrowed_at
- reservations: book_id, user_id, status, queue_position
- fines: loan_id, user_id, status
- reviews: book_id, user_id, rating, (book_id + user_id unique)
- notifications: user_id, type, is_read, created_at
- audit_logs: user_id, action, entity_type, entity_id, created_at

## Data Types

| Type | PostgreSQL | Description |
|------|------------|-------------|
| UUID | UUID | Primary keys, foreign keys |
| String | VARCHAR(n) | Limited text fields |
| Text | TEXT | Unlimited text |
| Boolean | BOOLEAN | True/false flags |
| Integer | INTEGER | Whole numbers |
| Decimal | DECIMAL(10,2) | Currency amounts |
| Date | DATE | Date only |
| DateTime | TIMESTAMP | Date and time |
| JSON | JSONB | Structured data |
| Enum | ENUM | Fixed value sets |

## Enums

```sql
CREATE TYPE user_role AS ENUM ('admin', 'librarian', 'member', 'guest');
CREATE TYPE book_status AS ENUM ('available', 'borrowed', 'reserved', 'maintenance', 'lost', 'damaged');
CREATE TYPE loan_status AS ENUM ('active', 'returned', 'overdue', 'lost');
CREATE TYPE reservation_status AS ENUM ('pending', 'ready', 'fulfilled', 'cancelled', 'expired');
CREATE TYPE fine_status AS ENUM ('pending', 'paid', 'waived', 'partial');
CREATE TYPE notification_type AS ENUM ('due_reminder', 'overdue_notice', 'reservation_ready', 'fine_notice', 'general');
CREATE TYPE book_condition AS ENUM ('new', 'good', 'fair', 'poor');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'online', 'other');
```
