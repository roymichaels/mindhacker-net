

# Fix: Bring Real Testimonials to Dean's Modal Profile

## Problem
The modal view (`PractitionerDetailView`) shows reviews from the `practitioner_reviews` table, which only has 3 short reviews. The real, rich, bilingual testimonials live in the `testimonials` table (with avatars, translated names/quotes, roles). When the profile was a full page, it used `PractitionerTestimonials` which queried the `testimonials` table -- but the modal uses `PractitionerReviewSlider` which only gets `practitioner_reviews` data.

## Solution
Update `PractitionerDetailView` to fetch testimonials from the `testimonials` table and pass them to the review slider alongside the `practitioner_reviews` data. The slider component will be updated to accept both data formats.

## Technical Details

### 1. Update `PractitionerDetailView.tsx`
- Add a query to fetch from the `testimonials` table (same query the landing page used).
- Merge testimonials into the review format expected by `PractitionerReviewSlider`.
- Pass merged reviews (testimonials first, then any `practitioner_reviews`) to the slider.

### 2. Update `PractitionerReviewSlider.tsx`
- Update the review type or accept a union type that includes testimonial fields (`name_en`, `quote_en`, `role`, `role_en`).
- Use language-aware display: show English name/quote when language is English, Hebrew otherwise.
- Show the reviewer's role as a subtitle.

### 3. No database changes needed
All data already exists and is translated in the `testimonials` table.

