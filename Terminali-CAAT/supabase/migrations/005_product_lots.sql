-- Product Lots table
CREATE TABLE product_lots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id),
  lot_number text NOT NULL,
  expiry_date date,
  quantity_received numeric(10,3) NOT NULL,
  quantity_in_stock numeric(10,3) NOT NULL,
  cost_price numeric(10,2),
  supplier text,
  received_at date DEFAULT CURRENT_DATE,
  qr_data text NOT NULL,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_lots_product ON product_lots(product_id);
CREATE INDEX idx_lots_expiry ON product_lots(expiry_date) WHERE is_active = true;
CREATE INDEX idx_lots_stock ON product_lots(quantity_in_stock) WHERE is_active = true;

-- Updated_at trigger
CREATE TRIGGER product_lots_updated_at BEFORE UPDATE ON product_lots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add lot_id to order_items (nullable for backwards compatibility with existing orders)
ALTER TABLE order_items ADD COLUMN lot_id uuid REFERENCES product_lots(id);
CREATE INDEX idx_order_items_lot ON order_items(lot_id);

-- Add min_stock to products
ALTER TABLE products ADD COLUMN min_stock numeric(10,3) DEFAULT 0;

-- RLS for product_lots
ALTER TABLE product_lots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do anything with lots"
  ON product_lots FOR ALL USING (public.user_role() = 'admin');

CREATE POLICY "Operators can read active lots"
  ON product_lots FOR SELECT USING (is_active = true OR public.user_role() = 'admin');

-- Trigger: recalculate order total on order_items changes (replaces client-side recalculation)
CREATE OR REPLACE FUNCTION recalculate_order_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders SET total_amount = (
    SELECT COALESCE(SUM(line_total), 0)
    FROM order_items
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
  )
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalc_order_total
  AFTER INSERT OR UPDATE OR DELETE ON order_items
  FOR EACH ROW EXECUTE FUNCTION recalculate_order_total();

-- Trigger: decrement lot stock when order confirmed, restore when cancelled
CREATE OR REPLACE FUNCTION decrement_lot_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- When order is confirmed: decrement stock
  IF NEW.status = 'confermato' AND OLD.status = 'bozza' THEN
    UPDATE product_lots pl
    SET quantity_in_stock = pl.quantity_in_stock - oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id
      AND pl.id = oi.lot_id;

    -- Deactivate lots with zero or negative stock
    UPDATE product_lots
    SET is_active = false
    WHERE quantity_in_stock <= 0 AND is_active = true;
  END IF;

  -- When order is cancelled from confirmed: restore stock
  IF NEW.status = 'annullato' AND OLD.status = 'confermato' THEN
    UPDATE product_lots pl
    SET quantity_in_stock = pl.quantity_in_stock + oi.quantity,
        is_active = true
    FROM order_items oi
    WHERE oi.order_id = NEW.id
      AND pl.id = oi.lot_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_stock_management
  AFTER UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION decrement_lot_stock();

-- Views
CREATE VIEW product_stock AS
SELECT
  p.id AS product_id,
  p.sku,
  p.name,
  p.category,
  p.unit,
  p.price,
  p.min_stock,
  COALESCE(SUM(pl.quantity_in_stock) FILTER (WHERE pl.is_active), 0) AS total_stock,
  COUNT(pl.id) FILTER (WHERE pl.is_active) AS active_lots,
  MIN(pl.expiry_date) FILTER (WHERE pl.is_active AND pl.quantity_in_stock > 0) AS nearest_expiry,
  CASE
    WHEN COALESCE(SUM(pl.quantity_in_stock) FILTER (WHERE pl.is_active), 0) <= 0 THEN 'esaurito'
    WHEN COALESCE(SUM(pl.quantity_in_stock) FILTER (WHERE pl.is_active), 0) < p.min_stock AND p.min_stock > 0 THEN 'sotto_scorta'
    WHEN MIN(pl.expiry_date) FILTER (WHERE pl.is_active) <= CURRENT_DATE THEN 'scaduto'
    WHEN MIN(pl.expiry_date) FILTER (WHERE pl.is_active) <= CURRENT_DATE + INTERVAL '7 days' THEN 'in_scadenza'
    ELSE 'ok'
  END AS stock_status
FROM products p
LEFT JOIN product_lots pl ON pl.product_id = p.id
WHERE p.is_active = true
GROUP BY p.id, p.sku, p.name, p.category, p.unit, p.price, p.min_stock;

CREATE VIEW expiring_lots AS
SELECT
  pl.id AS lot_id,
  pl.lot_number,
  pl.expiry_date,
  pl.quantity_in_stock,
  p.sku,
  p.name AS product_name,
  p.category,
  (pl.expiry_date - CURRENT_DATE) AS days_until_expiry
FROM product_lots pl
JOIN products p ON p.id = pl.product_id
WHERE pl.is_active = true
  AND pl.quantity_in_stock > 0
  AND pl.expiry_date IS NOT NULL
  AND pl.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY pl.expiry_date ASC;
