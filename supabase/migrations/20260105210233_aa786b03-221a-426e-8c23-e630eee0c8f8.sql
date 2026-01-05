-- Add English label column to menu_items
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS label_en TEXT;

-- Update existing menu items with English translations
UPDATE menu_items SET label_en = 'Consciousness Leap' WHERE label = 'קפיצה לתודעה חדשה';
UPDATE menu_items SET label_en = 'Personal Hypnosis Video' WHERE label = 'סרטון היפנוזה אישי';
UPDATE menu_items SET label_en = 'About' WHERE label = 'עלי';
UPDATE menu_items SET label_en = 'Testimonials' WHERE label = 'עדויות';
UPDATE menu_items SET label_en = 'FAQ' WHERE label = 'שאלות נפוצות';
UPDATE menu_items SET label_en = 'Courses' WHERE label = 'קורסים';
UPDATE menu_items SET label_en = 'Subscriptions' WHERE label = 'מנויים';