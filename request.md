# Required Setup - Library Management System

## Prerequisites

Before running this application, you need to configure the following:

## 1. PostgreSQL Database

Create a PostgreSQL database for the application:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE library_db;

# Create user (optional - can use default postgres user)
CREATE USER library_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE library_db TO library_user;
```

### Required Environment Variables

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=library_db
DB_USER=postgres (or library_user)
DB_PASSWORD=<your_password>
```

## 2. JWT Secrets

Generate secure secrets for JWT tokens:

```bash
# Generate JWT secret (minimum 64 characters)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate refresh token secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Required Environment Variables

```
JWT_SECRET=<generated_secret>
JWT_REFRESH_SECRET=<generated_refresh_secret>
```

## 3. Email Configuration (Optional for Development)

For email notifications (due date reminders, password reset), configure SMTP:

```
SMTP_HOST=smtp.gmail.com (or your provider)
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**Note:** For Gmail, use App Passwords (not your regular password).

## 4. Setup Steps

1. Copy `.env.example` to `.env`
2. Fill in all required values
3. Run database migrations
4. Start the application

```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Run migrations
cd server && npm run db:migrate

# Seed initial data (optional)
npm run db:seed

# Start development servers
npm run dev
```

## Security Notes

- Never commit `.env` file
- Use strong passwords (minimum 16 characters)
- Rotate JWT secrets periodically
- Use environment-specific secrets for staging/production
