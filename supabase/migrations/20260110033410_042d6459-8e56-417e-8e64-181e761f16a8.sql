-- Create products table for standalone purchasable products/services
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  price NUMERIC NOT NULL,
  price_usd NUMERIC,
  status TEXT DEFAULT 'active',
  product_type TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create orders table for product purchases
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id),
  amount NUMERIC NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  order_date TIMESTAMPTZ DEFAULT now(),
  payment_approved_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Products policies (public read, admin write)
CREATE POLICY "Products are viewable by everyone"
ON public.products FOR SELECT
USING (true);

CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Orders policies
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all orders"
ON public.orders FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert Personal Hypnosis product
INSERT INTO public.products (slug, title, title_en, description, description_en, price, price_usd, product_type, status)
VALUES (
  'personal-hypnosis-video',
  'סרטון היפנוזה אישי',
  'Personal Hypnosis Video',
  'סרטון היפנוזה מותאם אישית שנוצר במיוחד עבורך',
  'A personalized hypnosis video created specifically for you',
  297,
  79,
  'personal-hypnosis',
  'active'
);

-- Create trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create notification trigger for new orders
CREATE OR REPLACE FUNCTION public.notify_new_product_order()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_admin_notification(
    p_type := 'new_personal_hypnosis_order'::notification_type,
    p_priority := 'high'::notification_priority,
    p_title := 'הזמנה חדשה להיפנוזה אישית',
    p_message := 'התקבלה הזמנה חדשה להיפנוזה אישית',
    p_link := '/admin/products',
    p_metadata := jsonb_build_object('order_id', NEW.id, 'user_id', NEW.user_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_new_product_order
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_product_order();