-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'customer');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Orders
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'cancelled');

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  email text NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  subtotal numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  payment_provider text,
  payment_reference text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their own orders"
ON public.orders FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Staff can view all orders"
ON public.orders FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  product_name text NOT NULL,
  product_slug text NOT NULL,
  image_key text NOT NULL DEFAULT 'generic',
  unit_price numeric NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their own order items"
ON public.order_items FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

CREATE POLICY "Staff can view all order items"
ON public.order_items FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE INDEX order_items_order_id_idx ON public.order_items(order_id);
CREATE INDEX orders_user_id_idx ON public.orders(user_id);

-- Inventory (secret codes: never exposed to the Data API)
CREATE TYPE public.inventory_status AS ENUM ('available', 'allocated', 'delivered', 'void');

CREATE TABLE public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  secret_code text NOT NULL,
  status public.inventory_status NOT NULL DEFAULT 'available',
  order_item_id uuid REFERENCES public.order_items(id) ON DELETE SET NULL,
  allocated_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.inventory_items TO service_role;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX inventory_available_idx ON public.inventory_items(product_id) WHERE status = 'available';
CREATE INDEX inventory_order_item_idx ON public.inventory_items(order_item_id);

CREATE TRIGGER inventory_items_updated_at BEFORE UPDATE ON public.inventory_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Atomic allocation on payment
CREATE OR REPLACE FUNCTION public.allocate_order_inventory(_order_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item record;
  needed integer;
  allocated_total integer := 0;
  picked uuid;
BEGIN
  FOR item IN
    SELECT oi.id, oi.product_id, oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = _order_id
  LOOP
    needed := item.quantity - (
      SELECT count(*) FROM public.inventory_items
      WHERE order_item_id = item.id AND status IN ('allocated', 'delivered')
    );
    WHILE needed > 0 LOOP
      SELECT id INTO picked
      FROM public.inventory_items
      WHERE product_id = item.product_id AND status = 'available'
      ORDER BY created_at
      FOR UPDATE SKIP LOCKED
      LIMIT 1;

      IF picked IS NULL THEN
        EXIT;
      END IF;

      UPDATE public.inventory_items
      SET status = 'delivered',
          order_item_id = item.id,
          allocated_at = now(),
          delivered_at = now()
      WHERE id = picked;

      allocated_total := allocated_total + 1;
      needed := needed - 1;
      picked := NULL;
    END LOOP;
  END LOOP;
  RETURN allocated_total;
END;
$$;

REVOKE ALL ON FUNCTION public.allocate_order_inventory(uuid) FROM public, anon, authenticated;

-- Wishlist
CREATE TABLE public.wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

GRANT SELECT, INSERT, DELETE ON public.wishlist_items TO authenticated;
GRANT ALL ON public.wishlist_items TO service_role;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers manage their own wishlist"
ON public.wishlist_items FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Audit log
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin write access to catalog
CREATE POLICY "Admins can insert products"
ON public.products FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
ON public.products FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
ON public.products FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;

CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;

-- Seed demo stock: 8 keys per product
INSERT INTO public.inventory_items (product_id, secret_code)
SELECT p.id, upper(
  substr(md5(random()::text || p.id::text || n::text), 1, 5) || '-' ||
  substr(md5(random()::text || n::text || p.slug), 1, 5) || '-' ||
  substr(md5(random()::text || p.slug || n::text), 1, 5)
)
FROM public.products p, generate_series(1, 8) AS n;