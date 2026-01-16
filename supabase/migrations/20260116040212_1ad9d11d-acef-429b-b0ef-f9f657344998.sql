-- Add brand_color column to products table for data-driven product theming
ALTER TABLE products 
ADD COLUMN brand_color text DEFAULT 'primary';

-- Update existing products with their designated colors
UPDATE products SET brand_color = 'emerald' WHERE slug = 'personal-hypnosis-video';
UPDATE products SET brand_color = 'purple' WHERE slug = 'consciousness-leap';