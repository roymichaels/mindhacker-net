-- Add practitioner_id to offers table
ALTER TABLE offers ADD COLUMN practitioner_id UUID REFERENCES practitioners(id);

-- Add practitioner_id to products table  
ALTER TABLE products ADD COLUMN practitioner_id UUID REFERENCES practitioners(id);

-- Create index for faster queries
CREATE INDEX idx_offers_practitioner ON offers(practitioner_id);
CREATE INDEX idx_products_practitioner ON products(practitioner_id);