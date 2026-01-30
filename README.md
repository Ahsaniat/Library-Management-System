# Library Management System

A full-scale, self-hostable library management system built with modern technologies. Organizations can fork and customize this system to their needs.

## Features

### Core Features
- **Multi-role Authentication**: Admin, Librarian, Member, Guest roles with JWT authentication
- **Book Management**: CRUD operations, ISBN lookup, barcode generation, cover images
- **Catalog System**: Advanced search, filters, sorting, pagination
- **Circulation System**: Check-out/check-in, renewals, reservations, overdue tracking
- **Fine Management**: Automated fine calculation, payment tracking, waiver requests
- **Notification System**: Email notifications for due dates, availability, fines

### Technical Features
- TypeScript throughout (frontend and backend)
- PostgreSQL with Sequelize ORM
- React with TanStack Query for state management
- Tailwind CSS for styling
- Docker support for easy deployment
- Rate limiting and security headers

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Library_Management_System
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example server/.env
   # Edit server/.env with your database credentials and secrets
   ```

3. **Install dependencies**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

4. **Set up the database**
   ```bash
   # Create database
   psql -U postgres -c "CREATE DATABASE library_db;"
   
   # The database will auto-sync on first run in development
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev

   # Terminal 2 - Frontend
   cd client && npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - API: http://localhost:3001/api/v1

## Docker Deployment

### Using Docker Compose

1. **Set environment variables**
   ```bash
   export DB_PASSWORD="your_secure_password"
   export JWT_SECRET="your_jwt_secret_min_64_chars"
   export JWT_REFRESH_SECRET="your_refresh_secret_min_64_chars"
   ```

2. **Build and run**
   ```bash
   docker-compose up -d --build
   ```

3. **Access the application**
   - Frontend: http://localhost
   - API: http://localhost:3001/api/v1

## Project Structure

```
Library_Management_System/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # Zustand state management
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   └── validators/     # Input validation
│   └── package.json
├── __docs__/               # Documentation
├── logs/                   # Application logs
├── docker-compose.yml      # Docker orchestration
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh-token` - Refresh JWT tokens
- `GET /api/v1/auth/profile` - Get user profile
- `POST /api/v1/auth/change-password` - Change password

### Books
- `GET /api/v1/books` - Search/list books
- `GET /api/v1/books/:id` - Get book details
- `POST /api/v1/books` - Create book (Admin/Librarian)
- `PUT /api/v1/books/:id` - Update book (Admin/Librarian)
- `DELETE /api/v1/books/:id` - Delete book (Admin)

### Loans
- `POST /api/v1/loans/checkout` - Check out book (Librarian)
- `POST /api/v1/loans/checkin` - Return book (Librarian)
- `POST /api/v1/loans/:loanId/renew` - Renew loan
- `GET /api/v1/loans/my` - Get user's loans

### Reservations
- `POST /api/v1/reservations` - Create reservation
- `GET /api/v1/reservations/my` - Get user's reservations
- `POST /api/v1/reservations/:id/cancel` - Cancel reservation

## Configuration

### Environment Variables

See `.env.example` for all available configuration options:

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_HOST` | PostgreSQL host | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `JWT_SECRET` | JWT signing secret (64+ chars) | Yes |
| `JWT_REFRESH_SECRET` | Refresh token secret | Yes |
| `SMTP_HOST` | Email server host | No |
| `CORS_ORIGIN` | Allowed frontend origin | Yes |

## Security

- JWT authentication with refresh tokens
- Password hashing with bcrypt (12 rounds)
- Rate limiting on all endpoints
- CORS protection
- Helmet security headers
- Input validation with express-validator
- Parameterized SQL queries via Sequelize

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.
