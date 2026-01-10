-- Add foreign key from orders to profiles for proper query joins
ALTER TABLE public.orders 
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Delete "היפנוזה אישית" from content_products (now managed via products table)
DELETE FROM public.content_products WHERE slug = 'personal-hypnosis';