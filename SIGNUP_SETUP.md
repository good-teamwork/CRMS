# Signup Page Setup

## Overview
A complete signup page has been created for the MSP Management Portal with proper Neon database integration.

## Features

### Signup Page (`/account/signup`)
- **Form Fields:**
  - Full Name (required, min 2 characters)
  - Email (required, valid email format)
  - Password (required, min 6 characters, must contain uppercase, lowercase, and number)
  - Confirm Password (must match password)
  - Role selection (Admin, Manager, Support)

- **Validation:**
  - Client-side validation with real-time error display
  - Server-side validation for security
  - Password strength requirements
  - Email format validation
  - Duplicate email prevention

- **UI/UX:**
  - Modern, responsive design matching the signin page
  - Password visibility toggle
  - Loading states during submission
  - Error handling with user-friendly messages
  - Success feedback with automatic redirect

### API Endpoint (`/api/auth/signup`)
- **Security:**
  - Password hashing using bcryptjs (10 salt rounds)
  - Input validation and sanitization
  - SQL injection prevention using parameterized queries
  - Duplicate email checking

- **Database Integration:**
  - Connects to Neon PostgreSQL database
  - Uses existing `users` table schema
  - Proper error handling for database operations
  - Transaction safety

### Database Schema
The signup uses the existing `users` table:
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'support')),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Setup Instructions

1. **Environment Variables:**
   Make sure your `DATABASE_URL` environment variable is set:
   ```
   DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require
   ```

2. **Database Setup:**
   Run the SQL schema files to ensure the `users` table exists:
   - `users_schema.sql` - Creates the users table
   - `schema.sql` - Creates additional CRM tables

3. **Testing:**
   - Visit `/account/signup` to access the signup page
   - Visit `/api/test-db` to test database connectivity
   - Use the existing demo account or create a new one

## Navigation
- Signin page (`/account/signin`) now includes a "Create new account" link
- Signup page includes a "Sign in instead" link
- Both pages maintain consistent styling and user experience

## Security Features
- Password hashing with bcryptjs
- Input validation on both client and server
- SQL injection prevention
- Email uniqueness enforcement
- Role-based access control
- Secure session token generation

## Error Handling
- Comprehensive validation error messages
- Database error handling
- Network error handling
- User-friendly error display
- Proper HTTP status codes
