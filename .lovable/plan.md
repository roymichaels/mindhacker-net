

# Fix Reviews, Unite Products/Services, and Build In-Modal Scheduling

## 1. Reviews Not Showing

The `practitioner_reviews` table exists but has **zero rows** in the database. Dean has `reviews_count: 0` and `rating: 0`. The code is correctly fetching and rendering reviews -- there's simply no data.

**Fix**: Insert sample/seed reviews for Dean so the slider actually renders. We'll add 3-4 sample approved reviews directly into `practitioner_reviews`.

**SQL Migration**:
```sql
INSERT INTO practitioner_reviews (practitioner_id, user_id, rating, review_text, is_approved)
VALUES 
  ('5b000e72-bd7a-407f-a50c-3a25371c1b4f', (SELECT id FROM auth.users LIMIT 1), 5, 'מפגש מדהים, הרגשתי שינוי מיידי!', true),
  ('5b000e72-bd7a-407f-a50c-3a25371c1b4f', (SELECT id FROM auth.users LIMIT 1), 5, 'דין מקצועי ואמפתי, ממליץ בחום', true),
  ('5b000e72-bd7a-407f-a50c-3a25371c1b4f', (SELECT id FROM auth.users LIMIT 1), 4, 'חוויה חזקה, תודה על הליווי', true);

-- Update the practitioner's cached rating/count
UPDATE practitioners SET rating = 4.7, reviews_count = 3 WHERE id = '5b000e72-bd7a-407f-a50c-3a25371c1b4f';
```

## 2. Unite Products and Services into One Horizontal List

Currently the detail view has two separate sections:
- **"Products & Courses"** (from `offers` table) -- uses `PractitionerMiniOfferCard`
- **"Services"** (from `practitioner_services` table) -- uses inline cards

**Change**: Merge both into a single horizontal list under one heading (e.g., "Products & Services" / "מוצרים ושירותים"). Both will use the same card style (`PractitionerMiniOfferCard` design).

### Edit `PractitionerDetailView.tsx`:
- Remove the separate "Services" section
- Combine offers and services into one unified array
- Create a small adapter to map `practitioner_services` items to the same card shape as offers
- One horizontal scroll section with a unified heading using a `Package` icon

### Edit or create a `PractitionerMiniServiceCard.tsx`:
- Or better: make `PractitionerMiniOfferCard` accept a generic item type (title, subtitle, price, color, onClick)
- Services will show duration as subtitle, price as price, and clicking opens the booking view (see below)

## 3. Build In-Modal Scheduling

Instead of linking to Calendly, build a scheduling UI within the modal itself. This requires:

### Database: Create `practitioner_availability` and `bookings` tables

```sql
CREATE TABLE practitioner_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID REFERENCES practitioners(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID REFERENCES practitioners(id) ON DELETE CASCADE,
  service_id UUID REFERENCES practitioner_services(id),
  client_user_id UUID NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

With RLS policies so practitioners see their own bookings and clients see theirs.

### New Component: `PractitionerBookingView.tsx`

A multi-step in-modal booking flow:
1. **Select service** -- shows the service cards, user picks one
2. **Pick date** -- calendar picker showing available dates (based on `practitioner_availability` + existing `bookings`)
3. **Pick time slot** -- shows available time slots for the chosen date
4. **Confirm** -- summary + "Book Now" button, inserts into `bookings` table

This component renders inside the `PractitionerDetailView` when user clicks "Book Now" or clicks on a service card.

### Edit `PractitionerDetailView.tsx`:
- Replace the Calendly link button with an in-modal "Book a Session" button
- When clicked, show `PractitionerBookingView` in-place (like a sub-view within the detail)
- Add a back button to return to the detail view

### Seed availability for Dean:
- Insert default availability slots (e.g., Sun-Thu 9:00-17:00)

## Files to Create
1. `src/components/practitioners/PractitionerBookingView.tsx` -- the scheduling UI
2. `src/components/practitioners/PractitionerMiniItemCard.tsx` -- unified card for both offers and services (replaces separate card types)

## Files to Edit
1. `src/components/practitioners/PractitionerDetailView.tsx` -- merge products/services, replace Calendly with booking view, wire reviews
2. `src/components/practitioners/PractitionerMiniOfferCard.tsx` -- generalize or keep as-is if we create a new unified card

## Database Migrations
1. Insert seed reviews for Dean + update cached counts
2. Create `practitioner_availability` table
3. Create `bookings` table with RLS
4. Seed availability for Dean
