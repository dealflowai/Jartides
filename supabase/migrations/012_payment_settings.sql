-- Seed admin-editable payment-method settings (PayPal username, Interac
-- E-Transfer email, the confirmation phone number, and a per-method on/off
-- toggle for each). These are surfaced on the checkout payment-instructions
-- page and the FAQ, and managed from /admin/settings.
--
-- String values are stored as jsonb strings and the toggles as jsonb booleans,
-- matching the existing site_settings rows. ON CONFLICT DO NOTHING so re-running
-- the migration never clobbers values an admin has already changed.

INSERT INTO site_settings (key, value) VALUES
  ('payment_paypal_username',    '"JanJTP"'),
  ('payment_etransfer_email',    '"rayanwaleed7788@gmail.com"'),
  ('payment_confirmation_phone', '"226-344-6897"'),
  ('payment_paypal_enabled',     'true'),
  ('payment_etransfer_enabled',  'true')
ON CONFLICT (key) DO NOTHING;
