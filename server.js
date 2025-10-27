import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(cookieParser());

// Static files
app.use(express.static(join(__dirname, 'dist')));

// Initialize Neon database connection
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);

// Health check
app.get('/api', async (req, res) => {
  res.json({ message: 'API is running', database: 'connected' });
});

// Auth routes
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('API Route: Received login attempt for:', { email });

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Query the database for the user
    const users = await sql`
      SELECT id, email, password_hash, name, role, is_active 
      FROM users 
      WHERE email = ${email.toLowerCase()}
    `;

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(401).json({ error: "Account is deactivated" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Update last login
    await sql`
      UPDATE users 
      SET last_login = NOW() 
      WHERE id = ${user.id}
    `;

    // Create simple session token
    const token = Buffer.from(JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    })).toString('base64');

    res.cookie('auth-token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 86400000,
      sameSite: 'lax'
    });

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `;

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await sql`
      INSERT INTO users (name, email, password_hash, role, is_active, created_at)
      VALUES (${name}, ${email.toLowerCase()}, ${passwordHash}, ${role || 'user'}, true, NOW())
      RETURNING id, name, email, role
    `;

    const token = Buffer.from(JSON.stringify({
      sub: newUser[0].id,
      email: newUser[0].email,
      name: newUser[0].name,
      role: newUser[0].role,
      exp: Date.now() + (24 * 60 * 60 * 1000)
    })).toString('base64');

    res.cookie('auth-token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 86400000,
      sameSite: 'lax'
    });

    res.json({
      message: "Signup successful",
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name,
        role: newUser[0].role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth-token');
  res.json({ message: "Logout successful" });
});

app.get('/api/auth/session', async (req, res) => {
  try {
    const token = req.cookies['auth-token'];
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
    
    if (tokenData.exp < Date.now()) {
      return res.status(401).json({ error: "Token expired" });
    }

    res.json({ user: tokenData });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period) || 30;
    
    // Get merchant stats
    const merchants = await sql`
      SELECT 
        COUNT(*) as total_merchants,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '${days} days') as new_merchants,
        COUNT(*) FILTER (WHERE status = 'active') as active_merchants,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_merchants,
        COUNT(*) FILTER (WHERE status = 'under_review') as under_review_merchants
      FROM merchants
    `;

    res.json({ merchants: merchants[0] });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Serve the app for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});

