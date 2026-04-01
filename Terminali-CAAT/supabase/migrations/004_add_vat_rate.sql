-- Add VAT rate column to products
ALTER TABLE products ADD COLUMN vat_rate numeric(4,1) NOT NULL DEFAULT 22.0;
