import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sql = neon(process.env.DATABASE_URL);

async function setupDatabase() {
  try {
    console.log('📊 Setting up Neon database...\n');

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'support')),
          is_active BOOLEAN DEFAULT TRUE,
          last_login TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ Users table created');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`;
    console.log('✅ Indexes created');

    // Hash password for demo user
    const demoPassword = 'admin123';
    const passwordHash = await bcrypt.hash(demoPassword, 10);

    // Insert demo admin user if not exists
    await sql`
      INSERT INTO users (email, password_hash, name, role, is_active)
      VALUES (
        'admin@crm.com',
        ${passwordHash},
        'Demo Admin',
        'admin',
        true
      )
      ON CONFLICT (email) DO NOTHING
    `;

    console.log('✅ Demo admin user created');
    console.log('📧 Email: admin@crm.com');
    console.log('🔑 Password: admin123\n');
    console.log('✅ Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();

