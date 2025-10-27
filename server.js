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

    // Create user - always set role to 'user', never allow 'admin'
    const newUser = await sql`
      INSERT INTO users (name, email, password_hash, role, is_active)
      VALUES (${name}, ${email.toLowerCase()}, ${passwordHash}, 'user', true)
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
    
    let merchants = { total_merchants: 0, new_merchants: 0, active_merchants: 0, pending_merchants: 0, under_review_merchants: 0 };
    let transactions = { total_volume: 0, recent_volume: 0, total_revenue: 0, recent_revenue: 0 };
    let support = { open_tickets: 0, high_priority_open: 0 };
    let mobileApps = { active_apps: 0, apps_with_free_version: 0, total_downloads: 0, total_active_users: 0 };
    let appTransactions = { total_app_revenue: 0, recent_app_revenue: 0, free_version_transactions: 0, total_app_transactions: 0 };
    let dailyVolume = [];
    
    try {
      // Get merchants stats
      const merchantsData = await sql`
        SELECT 
          COUNT(*) as total_merchants,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '${days} days') as new_merchants,
          COUNT(*) FILTER (WHERE status = 'active') as active_merchants,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_merchants,
          COUNT(*) FILTER (WHERE status = 'under_review') as under_review_merchants,
          COALESCE(SUM(CASE WHEN created_at::date >= CURRENT_DATE - INTERVAL '${days} days' THEN 1 ELSE 0 END), 0) as loyal_merchants
        FROM merchants
      `;
      if (merchantsData && merchantsData[0]) {
        merchants = merchantsData[0];
      }
    } catch (err) {
      console.log('Merchants query error:', err.message);
    }

    try {
      // Get transactions stats
      const transactionsData = await sql`
        SELECT 
          COALESCE(SUM(amount), 0) as total_volume,
          COALESCE(SUM(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN amount ELSE 0 END), 0) as recent_volume,
          COALESCE(SUM(processing_fee), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN processing_fee ELSE 0 END), 0) as recent_revenue
        FROM processing_transactions
      `;
      if (transactionsData && transactionsData[0]) {
        transactions = transactionsData[0];
      }
    } catch (err) {
      console.log('Transactions query error:', err.message);
    }

    try {
      // Get support tickets stats
      const supportData = await sql`
        SELECT 
          COUNT(*) FILTER (WHERE status IN ('open', 'in_progress')) as open_tickets,
          COUNT(*) FILTER (WHERE priority = 'high' AND status IN ('open', 'in_progress')) as high_priority_open
        FROM support_tickets
      `;
      if (supportData && supportData[0]) {
        support = supportData[0];
      }
    } catch (err) {
      console.log('Support tickets query error:', err.message);
    }

    try {
      // Get mobile apps stats
      const mobileAppsData = await sql`
        SELECT 
          COUNT(*) FILTER (WHERE is_active = true) as active_apps,
          COUNT(*) FILTER (WHERE free_version_available = true) as apps_with_free_version,
          COALESCE(SUM(downloads_count), 0) as total_downloads,
          COALESCE(SUM(active_users), 0) as total_active_users
        FROM mobile_applications
      `;
      if (mobileAppsData && mobileAppsData[0]) {
        mobileApps = mobileAppsData[0];
      }
    } catch (err) {
      console.log('Mobile apps query error:', err.message);
    }

    try {
      // Get app transactions stats
      const appTransactionsData = await sql`
        SELECT 
          COALESCE(SUM(revenue), 0) as total_app_revenue,
          COALESCE(SUM(CASE WHEN transaction_date > NOW() - INTERVAL '7 days' THEN revenue ELSE 0 END), 0) as recent_app_revenue,
          COUNT(*) FILTER (WHERE is_free_version = true) as free_version_transactions,
          COUNT(*) as total_app_transactions
        FROM app_transactions
      `;
      if (appTransactionsData && appTransactionsData[0]) {
        appTransactions = appTransactionsData[0];
      }
    } catch (err) {
      console.log('App transactions query error:', err.message);
    }

    try {
      // Get daily volume for chart
      const dailyVolumeData = await sql`
        SELECT 
          DATE(created_at) as date,
          SUM(amount) as daily_volume
        FROM processing_transactions
        WHERE created_at > NOW() - INTERVAL '${days} days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;
      dailyVolume = dailyVolumeData || [];
    } catch (err) {
      console.log('Daily volume query error:', err.message);
    }

    const stats = {
      merchants,
      transactions,
      support,
      mobileApps,
      appTransactions,
      dailyVolume,
    };

    res.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Get mobile apps
app.get('/api/mobile-apps', async (req, res) => {
  try {
    const apps = await sql`
      SELECT id, app_name, app_type, description, status, is_free_version, total_downloads, active_users, created_at
      FROM mobile_applications
      ORDER BY created_at DESC
    `;
    res.json(apps);
  } catch (error) {
    console.error("Mobile apps error:", error);
    res.status(500).json({ error: "Failed to fetch mobile apps" });
  }
});

// Create new mobile app
app.post('/api/mobile-apps', async (req, res) => {
  try {
    const { app_name, app_type, description, status, is_free_version, total_downloads, active_users } = req.body;
    
    const newApp = await sql`
      INSERT INTO mobile_applications (app_name, app_type, description, status, is_free_version, total_downloads, active_users)
      VALUES (${app_name}, ${app_type || null}, ${description || null}, ${status || 'active'}, ${is_free_version || false}, ${total_downloads || 0}, ${active_users || 0})
      RETURNING *
    `;
    
    res.json(newApp[0]);
  } catch (error) {
    console.error("Create mobile app error:", error);
    res.status(500).json({ error: "Failed to create mobile app" });
  }
});

// Update mobile app
app.put('/api/mobile-apps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { app_name, app_type, description, status, is_free_version, total_downloads, active_users } = req.body;
    
    const updatedApp = await sql`
      UPDATE mobile_applications 
      SET app_name = ${app_name}, app_type = ${app_type}, description = ${description}, status = ${status},
          is_free_version = ${is_free_version}, total_downloads = ${total_downloads}, active_users = ${active_users}
      WHERE id = ${id}
      RETURNING *
    `;
    
    res.json(updatedApp[0]);
  } catch (error) {
    console.error("Update mobile app error:", error);
    res.status(500).json({ error: "Failed to update mobile app" });
  }
});

// Delete mobile app
app.delete('/api/mobile-apps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM mobile_applications WHERE id = ${id}`;
    res.json({ message: "Mobile app deleted" });
  } catch (error) {
    console.error("Delete mobile app error:", error);
    res.status(500).json({ error: "Failed to delete mobile app" });
  }
});

// Get merchants
app.get('/api/merchants', async (req, res) => {
  try {
    const merchants = await sql`
      SELECT * FROM merchants ORDER BY created_at DESC
    `;
    res.json(merchants);
  } catch (error) {
    console.error("Merchants error:", error);
    res.status(500).json({ error: "Failed to fetch merchants" });
  }
});

// Get transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await sql`
      SELECT * FROM processing_transactions ORDER BY processed_at DESC
    `;
    res.json(transactions);
  } catch (error) {
    console.error("Transactions error:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Get support tickets
app.get('/api/support', async (req, res) => {
  try {
    const tickets = await sql`
      SELECT * FROM support_tickets ORDER BY created_at DESC
    `;
    res.json(tickets);
  } catch (error) {
    console.error("Support tickets error:", error);
    res.status(500).json({ error: "Failed to fetch support tickets" });
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

