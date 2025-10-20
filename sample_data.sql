-- Sample Data for CRM Testing
INSERT INTO merchants (business_name, contact_name, email, phone, business_type, address, city, state, zip_code, status, is_loyal_merchant) VALUES 
('Acme Electronics', 'John Smith', 'john@acme.com', '+1-555-0101', 'Retail', '123 Main St', 'New York', 'NY', '10001', 'active', true),
('Bella Restaurant', 'Maria Garcia', 'maria@bella.com', '+1-555-0102', 'Restaurant', '456 Oak Ave', 'Los Angeles', 'CA', '90210', 'active', false),
('Tech Solutions Inc', 'David Johnson', 'david@techsol.com', '+1-555-0103', 'Technology', '789 Pine Rd', 'Chicago', 'IL', '60601', 'pending', false),
('Fashion Boutique', 'Sarah Wilson', 'sarah@fashion.com', '+1-555-0104', 'Retail', '321 Elm St', 'Miami', 'FL', '33101', 'active', true);

INSERT INTO mobile_applications (app_name, app_type, description, status, is_free_version, total_downloads, active_users) VALUES 
('POS Express', 'Point of Sale', 'Mobile point of sale application for small businesses', 'active', true, 15000, 3200),
('Retail Pro', 'Business Utility', 'Inventory management and sales tracking', 'active', false, 8500, 2100),
('Salon Suite', 'Business Utility', 'Appointment booking and client management', 'active', true, 12000, 2800),
('FoodCart', 'Point of Sale', 'Food truck and mobile vendor POS system', 'active', false, 6800, 1500),
('GymGo', 'Business Utility', 'Gym membership and class booking system', 'active', true, 9500, 1800);

INSERT INTO processing_transactions (merchant_id, transaction_id, transaction_amount, transaction_fee, our_revenue, is_cash_transaction, payment_method, status, processed_at) VALUES 
((SELECT id FROM merchants WHERE business_name = 'Acme Electronics'), 'TXN-001', 125.50, 3.64, 1.82, false, 'credit_card', 'completed', NOW() - INTERVAL '1 day'),
((SELECT id FROM merchants WHERE business_name = 'Bella Restaurant'), 'TXN-002', 89.75, 2.60, 1.30, false, 'credit_card', 'completed', NOW() - INTERVAL '2 hours'),
((SELECT id FROM merchants WHERE business_name = 'Tech Solutions Inc'), 'TXN-003', 2500.00, 72.50, 36.25, false, 'bank_transfer', 'completed', NOW() - INTERVAL '1 hour'),
((SELECT id FROM merchants WHERE business_name = 'Fashion Boutique'), 'TXN-004', 45.99, 1.33, 0.67, true, 'cash', 'completed', NOW() - INTERVAL '30 minutes');

INSERT INTO support_tickets (merchant_id, subject, description, priority, status) VALUES 
((SELECT id FROM merchants WHERE business_name = 'Acme Electronics'), 'Payout delay investigation', 'Customer reported delayed payout for transaction TXN-001', 'high', 'open'),
((SELECT id FROM merchants WHERE business_name = 'Bella Restaurant'), 'App login issues', 'Unable to access mobile app dashboard', 'medium', 'in_progress'),
((SELECT id FROM merchants WHERE business_name = 'Tech Solutions Inc'), 'API integration help', 'Need assistance with payment API integration', 'low', 'resolved');

INSERT INTO app_transactions (app_id, transaction_id, transaction_amount, our_revenue, is_free_version_transaction, payment_method, status, processed_at) VALUES 
((SELECT id FROM mobile_applications WHERE app_name = 'POS Express'), 'APP-001', 29.99, 0.60, false, 'credit_card', 'completed', NOW() - INTERVAL '1 day'),
((SELECT id FROM mobile_applications WHERE app_name = 'Retail Pro'), 'APP-002', 49.99, 1.00, false, 'credit_card', 'completed', NOW() - INTERVAL '6 hours'),
((SELECT id FROM mobile_applications WHERE app_name = 'Salon Suite'), 'APP-003', 0.00, 0.00, true, 'free', 'completed', NOW() - INTERVAL '2 hours'),
((SELECT id FROM mobile_applications WHERE app_name = 'FoodCart'), 'APP-004', 99.99, 2.00, false, 'credit_card', 'completed', NOW() - INTERVAL '1 hour');
