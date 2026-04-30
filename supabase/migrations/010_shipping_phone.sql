-- Add shipping_phone to orders. Carriers (FedEx etc.) require a recipient phone
-- on international shipments to issue commercial invoices and contact the
-- recipient if customs has questions.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_phone text;
