-- CRM Database Schema
-- This file contains all the tables needed for the CRM application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Merchants table
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100),
    website VARCHAR(255),
    business_registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    business_license VARCHAR(100),
    years_in_business INTEGER,
    estimated_monthly_volume DECIMAL(15,2),
    
    -- Business Address
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(2) DEFAULT 'US',
    
    -- Contact Information
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    
    -- Personal Information
    personal_first_name VARCHAR(100),
    personal_last_name VARCHAR(100),
    personal_email VARCHAR(255),
    personal_phone VARCHAR(20),
    date_of_birth DATE,
    ssn_last_four VARCHAR(4),
    
    -- Personal Address
    personal_address TEXT,
    personal_city VARCHAR(100),
    personal_state VARCHAR(100),
    personal_zip_code VARCHAR(20),
    
    -- Processing Settings
    monthly_processing_limit DECIMAL(15,2),
    processing_fee_rate DECIMAL(5,4) DEFAULT 0.029,
    
    -- Status and Flags
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'under_review', 'suspended', 'rejected')),
    is_loyal_merchant BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processing Transactions table
CREATE TABLE IF NOT EXISTS processing_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    transaction_amount DECIMAL(15,2) NOT NULL,
    transaction_fee DECIMAL(15,2) NOT NULL,
    our_revenue DECIMAL(15,2) NOT NULL,
    is_cash_transaction BOOLEAN DEFAULT FALSE,
    payment_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support Tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mobile Applications table
CREATE TABLE IF NOT EXISTS mobile_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_name VARCHAR(255) NOT NULL,
    app_type VARCHAR(100),
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'deprecated')),
    is_free_version BOOLEAN DEFAULT TRUE,
    total_downloads INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App Transactions table
CREATE TABLE IF NOT EXISTS app_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id UUID NOT NULL REFERENCES mobile_applications(id) ON DELETE CASCADE,
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    transaction_amount DECIMAL(15,2) NOT NULL,
    our_revenue DECIMAL(15,2) NOT NULL,
    is_free_version_transaction BOOLEAN DEFAULT TRUE,
    payment_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_merchants_status ON merchants(status);
CREATE INDEX IF NOT EXISTS idx_merchants_created_at ON merchants(created_at);
CREATE INDEX IF NOT EXISTS idx_merchants_is_loyal ON merchants(is_loyal_merchant);

CREATE INDEX IF NOT EXISTS idx_processing_transactions_merchant_id ON processing_transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_processing_transactions_processed_at ON processing_transactions(processed_at);
CREATE INDEX IF NOT EXISTS idx_processing_transactions_status ON processing_transactions(status);

CREATE INDEX IF NOT EXISTS idx_support_tickets_merchant_id ON support_tickets(merchant_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);

CREATE INDEX IF NOT EXISTS idx_mobile_applications_status ON mobile_applications(status);
CREATE INDEX IF NOT EXISTS idx_mobile_applications_is_free ON mobile_applications(is_free_version);

CREATE INDEX IF NOT EXISTS idx_app_transactions_app_id ON app_transactions(app_id);
CREATE INDEX IF NOT EXISTS idx_app_transactions_processed_at ON app_transactions(processed_at);
CREATE INDEX IF NOT EXISTS idx_app_transactions_status ON app_transactions(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON merchants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_processing_transactions_updated_at BEFORE UPDATE ON processing_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mobile_applications_updated_at BEFORE UPDATE ON mobile_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_transactions_updated_at BEFORE UPDATE ON app_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
