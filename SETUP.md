# Neon Database Setup Instructions

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

This will install:
- express
- cors
- cookie-parser
- dotenv
- bcryptjs
- @neondatabase/serverless

### 2. Setup Database
```bash
npm run setup:db
```

This will:
- Create the `users` table in your Neon database
- Insert a demo admin user
- Email: `admin@crm.com`
- Password: `admin123`

### 3. Run the Backend Server
```bash
npm run dev
```

This starts the backend server on port 4000 with:
- API endpoints connected to Neon database
- Express server with CORS enabled
- Cookie-based authentication

### 4. In Another Terminal, Run the Frontend
```bash
npm run dev:vite
```

This starts the Vite dev server on port 5173

### 5. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

## How It Works

1. **Backend Server (port 4000)**
   - Handles all API requests
   - Connects to Neon database using DATABASE_URL from .env
   - Provides authentication endpoints
   - Vite proxies API calls to this server

2. **Frontend Server (port 5173)**
   - Serves the React application
   - Hot module replacement enabled
   - Proxies `/api/*` requests to backend

## Environment Variables

Your `.env` file should contain:
```
DATABASE_URL='your-neon-database-url'
AUTH_SECRET='your-secret'
AUTH_URL='http://localhost:4000'
```

## Database Schema

The setup creates a `users` table with:
- id (UUID)
- email (unique)
- password_hash
- name
- role (admin, manager, support)
- is_active
- last_login
- created_at
- updated_at

## Troubleshooting

If you see connection errors:
1. Check that DATABASE_URL is set in .env
2. Verify your Neon database is accessible
3. Make sure both servers are running (frontend and backend)

