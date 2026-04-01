-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role (public schema — no auth schema permissions on cloud)
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS text AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT USING (public.user_role() = 'admin');
CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE USING (public.user_role() = 'admin');

-- PRODUCTS
CREATE POLICY "Anyone authenticated can read active products"
  ON products FOR SELECT USING (is_active = true OR public.user_role() = 'admin');
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT WITH CHECK (public.user_role() = 'admin');
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE USING (public.user_role() = 'admin');
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE USING (public.user_role() = 'admin');

-- CUSTOMERS
CREATE POLICY "Anyone authenticated can read customers"
  ON customers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can insert customers"
  ON customers FOR INSERT WITH CHECK (public.user_role() = 'admin');
CREATE POLICY "Admins can update customers"
  ON customers FOR UPDATE USING (public.user_role() = 'admin');
CREATE POLICY "Admins can delete customers"
  ON customers FOR DELETE USING (public.user_role() = 'admin');

-- ORDERS
CREATE POLICY "Admins can do anything with orders"
  ON orders FOR ALL USING (public.user_role() = 'admin');
CREATE POLICY "Operators can read own orders"
  ON orders FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Operators can create orders"
  ON orders FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Operators can update own draft orders"
  ON orders FOR UPDATE USING (created_by = auth.uid() AND status = 'bozza');

-- ORDER ITEMS
CREATE POLICY "Admins can do anything with order items"
  ON order_items FOR ALL USING (public.user_role() = 'admin');
CREATE POLICY "Operators can read items of own orders"
  ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.created_by = auth.uid()));
CREATE POLICY "Operators can insert items into own draft orders"
  ON order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.created_by = auth.uid() AND orders.status = 'bozza'));
CREATE POLICY "Operators can update items in own draft orders"
  ON order_items FOR UPDATE USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.created_by = auth.uid() AND orders.status = 'bozza'));
CREATE POLICY "Operators can delete items from own draft orders"
  ON order_items FOR DELETE USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.created_by = auth.uid() AND orders.status = 'bozza'));
