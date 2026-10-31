-- ========================================================
-- BRIGHTLOOP SMS - SEED DATA (supabase/seed.sql)
-- Development & Testing initial records
-- ========================================================

-- Sample Products
INSERT INTO public.products (id, name, product_type, sales_price, cost_price, notes, is_active)
VALUES
    ('a0000001-0000-0000-0000-000000000001', 'BrightERP Suite', 'software', 2000.00, 500.00, 'Enterprise ERP solution with accounting and inventory', true),
    ('a0000001-0000-0000-0000-000000000002', 'BrightCRM Pro', 'software', 1200.00, 300.00, 'Customer relationship and lead management', true),
    ('a0000001-0000-0000-0000-000000000003', 'Dedicated Cloud Hosting', 'service', 800.00, 400.00, 'Managed cloud server instance with daily backups', true)
ON CONFLICT DO NOTHING;

-- Sample Product Variants (Base + Variant price logic)
-- E.g. ERP Base = 2000; Odoo Variant = +560 -> Final = 2560
INSERT INTO public.product_variants (product_id, variant_name, additional_price, is_active)
VALUES
    ('a0000001-0000-0000-0000-000000000001', 'Standard Edition', 0.00, true),
    ('a0000001-0000-0000-0000-000000000001', 'Odoo Integration Pack', 560.00, true),
    ('a0000001-0000-0000-0000-000000000002', 'Enterprise Connectors', 400.00, true)
ON CONFLICT DO NOTHING;

-- Sample Subscription Plans (All 4 billing frequencies)
INSERT INTO public.subscription_plans (id, name, description, price, billing_frequency, min_quantity, auto_close, allow_early_closure, allow_pause, allow_renewal, is_active)
VALUES
    ('b0000001-0000-0000-0000-000000000001', 'Daily Cloud Backup', 'Daily maintenance and offsite snapshot plan', 50.00, 'daily', 1, false, true, true, true, true),
    ('b0000001-0000-0000-0000-000000000002', 'Weekly Managed Support', 'Weekly SLA support sprint', 300.00, 'weekly', 1, false, true, true, true, true),
    ('b0000001-0000-0000-0000-000000000003', 'Monthly Business Cloud', 'Standard monthly billing plan for ERP Suite', 2000.00, 'monthly', 1, false, true, true, true, true),
    ('b0000001-0000-0000-0000-000000000004', 'Annual Enterprise Suite', 'Yearly discounted agreement for complete software stack', 20000.00, 'yearly', 1, false, true, true, true, true)
ON CONFLICT DO NOTHING;

-- Sample Tax Rules
INSERT INTO public.tax_rules (name, rate, description, is_active)
VALUES
    ('GST Standard 18%', 18.00, 'Standard Goods & Services Tax for software and services', true),
    ('GST Reduced 5%', 5.00, 'Reduced GST rate for educational institutions', true)
ON CONFLICT DO NOTHING;

-- Sample Discount Rules
INSERT INTO public.discount_rules (name, description, discount_type, discount_value, min_purchase_amount, min_quantity, start_date, end_date, max_usage_count, scope, is_active)
VALUES
    ('Launch Promo ₹500 Off', 'Fixed 500 off on subscriptions over 2000', 'fixed', 500.00, 2000.00, 1, CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', 100, 'subscription', true),
    ('Early Bird 10%', '10% discount on annual subscriptions', 'percentage', 10.00, 1000.00, 1, CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', 50, 'subscription', true)
ON CONFLICT DO NOTHING;

-- Sample Quotation Template
INSERT INTO public.quotation_templates (name, description, default_plan_id, validity_days, is_active)
VALUES
    ('Standard ERP Onboarding Template', 'Default 15-day quotation offer for new ERP clients', 'b0000001-0000-0000-0000-000000000003', 15, true)
ON CONFLICT DO NOTHING;

