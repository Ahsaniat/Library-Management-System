# Library Management System - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Browser   │  │  Mobile App │  │  API Client │              │
│  │   (React)   │  │   (Future)  │  │  (Third-party)             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          └────────────────┼────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Nginx     │
                    │  (Reverse   │
                    │   Proxy)    │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
   │   Static    │  │   API       │  │   API       │
   │   Files     │  │   Server    │  │   Server    │
   │   (React)   │  │   (Node 1)  │  │   (Node 2)  │
   └─────────────┘  └──────┬──────┘  └──────┬──────┘
                           │                │
                    ┌──────▼────────────────▼──────┐
                    │                              │
                    │        PostgreSQL            │
                    │        Database              │
                    │                              │
                    └──────────────────────────────┘
```

## Component Architecture

### Frontend (React)
```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Pages     │  │ Components  │  │   Hooks     │          │
│  │  (Routes)   │  │    (UI)     │  │  (Logic)    │          │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
│         │                │                │                  │
│         └────────────────┼────────────────┘                  │
│                          │                                   │
│  ┌─────────────┐  ┌──────▼──────┐  ┌─────────────┐          │
│  │   Zustand   │  │  TanStack   │  │   Services  │          │
│  │   (State)   │  │   Query     │  │    (API)    │          │
│  └─────────────┘  └─────────────┘  └──────┬──────┘          │
│                                           │                  │
└───────────────────────────────────────────┼─────────────────┘
                                            │
                                     ┌──────▼──────┐
                                     │   Axios     │
                                     │   (HTTP)    │
                                     └─────────────┘
```

### Backend (Express)
```
┌─────────────────────────────────────────────────────────────┐
│                    Express Application                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    Middleware                        │    │
│  │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ │    │
│  │  │Helmet │ │ CORS  │ │ Rate  │ │Logger │ │ Auth  │ │    │
│  │  │       │ │       │ │Limiter│ │       │ │       │ │    │
│  │  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│  ┌───────────────────────▼──────────────────────────────┐   │
│  │                    Routes                             │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │   │
│  │  │ Auth │ │Books │ │Loans │ │Reserv│ │Users │       │   │
│  │  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘       │   │
│  └─────┼────────┼────────┼────────┼────────┼────────────┘   │
│        └────────┴────────┼────────┴────────┘                │
│                          │                                   │
│  ┌───────────────────────▼──────────────────────────────┐   │
│  │                  Controllers                          │   │
│  │  Validate → Process → Respond                         │   │
│  └───────────────────────┬──────────────────────────────┘   │
│                          │                                   │
│  ┌───────────────────────▼──────────────────────────────┐   │
│  │                    Services                           │   │
│  │  Business Logic, Transactions, External APIs          │   │
│  └───────────────────────┬──────────────────────────────┘   │
│                          │                                   │
│  ┌───────────────────────▼──────────────────────────────┐   │
│  │                    Models                             │   │
│  │  Sequelize ORM, Associations, Validations             │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### Authentication Flow
```
User → Login Form → POST /api/v1/auth/login
                         │
                         ▼
                   Validate Input
                         │
                         ▼
                   Check Credentials
                         │
                    ┌────┴────┐
                    │ Valid?  │
                    └────┬────┘
              ┌──────────┼──────────┐
              ▼          ▼          ▼
           No: 401    Yes: Generate  Update
           Error      JWT Tokens     Last Login
                         │
                         ▼
                   Return Tokens
                         │
                         ▼
                   Store in Zustand
                         │
                         ▼
                   Redirect to Dashboard
```

### Book Checkout Flow
```
Librarian → Scan Barcode → POST /api/v1/loans/checkout
                                    │
                                    ▼
                             ┌──────────────┐
                             │  Transaction │
                             └──────┬───────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
    Validate Book Copy       Validate User            Check Fines
           │                        │                        │
           └────────────────────────┼────────────────────────┘
                                    │
                             ┌──────┴──────┐
                             │  All Valid? │
                             └──────┬──────┘
                        ┌───────────┼───────────┐
                        ▼           ▼           ▼
                    No: 4xx      Update      Create
                    Error        BookCopy    Loan Record
                                 Status           │
                                    │             │
                                    └──────┬──────┘
                                           ▼
                                   Fulfill Reservation
                                   (if applicable)
                                           │
                                           ▼
                                    Commit Transaction
                                           │
                                           ▼
                                    Return Loan Details
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Security Stack                           │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: Network                                            │
│  ├─ HTTPS/TLS encryption                                     │
│  ├─ Rate limiting (100 req/15min general, 10 req/15min auth)│
│  └─ CORS restrictions                                        │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Application                                        │
│  ├─ Helmet security headers (CSP, HSTS, X-Frame-Options)    │
│  ├─ Input validation (express-validator, Zod)               │
│  └─ Request size limits (10MB)                               │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Authentication                                     │
│  ├─ JWT with short expiry (15min access, 7d refresh)        │
│  ├─ bcrypt password hashing (12 rounds)                      │
│  └─ Role-based access control (RBAC)                         │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: Data                                               │
│  ├─ Parameterized queries (Sequelize ORM)                    │
│  ├─ No secret storage in code                                │
│  └─ Audit logging                                            │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

### Development
```
localhost:5173 (Vite) ──► localhost:3001 (Express) ──► localhost:5432 (PostgreSQL)
```

### Production (Docker)
```
                    ┌─────────────────────┐
                    │   Docker Network    │
                    │   library_network   │
                    └─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼───────┐     ┌───────▼───────┐     ┌───────▼───────┐
│   client      │     │    server     │     │      db       │
│   (nginx)     │     │   (node)      │     │  (postgres)   │
│   Port: 80    │────►│   Port: 3001  │────►│   Port: 5432  │
└───────────────┘     └───────────────┘     └───────────────┘
                                                    │
                                            ┌───────▼───────┐
                                            │ postgres_data │
                                            │   (volume)    │
                                            └───────────────┘
```
