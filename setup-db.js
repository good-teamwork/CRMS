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

    // Read schema file
    const schema = fs.readFileSync(join(__dirname, 'users_schema.sql'), 'utf8');
    
    // Execute schema
    await sql(schema);
    console.log('✅ Database schema created');

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

