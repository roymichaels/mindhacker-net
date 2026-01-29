
# תוכנית: טאב ניהול דפי נחיתה באדמין

## סיכום
יצירת מערכת data-driven לניהול דפי נחיתה, שהופכת את הדפים הקיימים (Index, ConsciousnessLeapLanding, PersonalHypnosisLanding) לתבניות גנריות שנשלטות מהדאטאבייס.

## מה קיים היום

### דפי נחיתה קיימים:
1. **דף הבית (Index.tsx)** - HeroSection + IntrospectionPromo + PersonalVideoPromo + ConsciousnessLeapPromo
2. **קפיצה לתודעה (ConsciousnessLeapLanding.tsx)** - Hero, Pain Points, Process, Benefits, For Who, Testimonials, FAQs, Form
3. **הקלטת היפנוזה אישית (PersonalHypnosisLanding.tsx)** - Hero, Pain Points, Process, Benefits, Testimonial, CTA

### מערכת Offers קיימת:
- כבר יש טבלת `offers` עם שדות רבים ללנדינג פייג'ס:
  - hero_heading/hero_subheading
  - pain_points, process_steps, benefits, faqs, includes (כל אלה JSONB)
  - brand_color, badge_text, cta_type, cta_text
  - landing_page_route, landing_page_enabled

## הארכיטקטורה החדשה

### 1. טבלת landing_pages חדשה

```sql
CREATE TABLE landing_pages (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  template_type TEXT NOT NULL, -- 'homepage', 'product', 'lead_capture', 'custom'
  
  -- Offer connection (optional)
  offer_id UUID REFERENCES offers(id),
  
  -- Meta & SEO
  title_he TEXT,
  title_en TEXT,
  seo_title_he TEXT,
  seo_title_en TEXT,
  seo_description_he TEXT,
  seo_description_en TEXT,
  
  -- Hero Section
  hero_heading_he TEXT,
  hero_heading_en TEXT,
  hero_subheading_he TEXT,
  hero_subheading_en TEXT,
  hero_image_url TEXT,
  hero_video_url TEXT,
  
  -- Sections Configuration (JSONB)
  sections_order JSONB, -- ["hero", "pain_points", "process", "benefits", "testimonials", "faq", "cta"]
  sections_config JSONB, -- Detailed config per section
  
  -- Content Blocks (JSONB for flexibility)
  pain_points JSONB,
  process_steps JSONB,
  benefits JSONB,
  for_who JSONB,
  not_for_who JSONB,
  testimonials JSONB,
  faqs JSONB,
  includes JSONB,
  
  -- Styling
  brand_color TEXT,
  custom_css TEXT,
  
  -- CTA
  primary_cta_type TEXT, -- 'checkout', 'form', 'link', 'contact'
  primary_cta_text_he TEXT,
  primary_cta_text_en TEXT,
  primary_cta_link TEXT,
  form_id UUID REFERENCES custom_forms(id),
  
  -- Status
  is_published BOOLEAN DEFAULT FALSE,
  is_homepage BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. דף אדמין חדש: LandingPages.tsx

**מיקום**: `/admin/landing-pages`

**פיצ'רים**:
- רשימת כל דפי הנחיתה עם preview, status, ו-analytics
- יצירת דף חדש מתבנית (Homepage/Product/Lead Capture/Custom)
- עריכת דף קיים עם Visual Builder פשוט
- Duplicate של דף קיים
- Preview בכרטיסייה חדשה

**UI מוצע**:
```text
┌──────────────────────────────────────────────────────────────────┐
│  דפי נחיתה                                               + חדש  │
├──────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 🏠 דף הבית                               ✅ פורסם │ עריכה  │ │
│  │    /  •  Template: Homepage  •  3,245 צפיות                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 🧠 קפיצה לתודעה חדשה                     ✅ פורסם │ עריכה  │ │
│  │    /consciousness-leap  •  Template: Product  •  1,892 צפיות│ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 🎬 הקלטת היפנוזה אישית                   ✅ פורסם │ עריכה  │ │
│  │    /personal-hypnosis  •  Template: Product  •  2,156 צפיות │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### 3. Dialog עריכה עם Tabs

```text
┌─────────────────────────────────────────────────────────────────┐
│  עריכת דף: קפיצה לתודעה חדשה                              [X]  │
├─────────────────────────────────────────────────────────────────┤
│  [כללי] [Hero] [תוכן] [סעיפים] [עיצוב] [SEO] [CTA]             │
├─────────────────────────────────────────────────────────────────┤
│  Tab: תוכן                                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  נקודות כאב (Pain Points)                           [+]  │  │
│  │  ├── 1. אתה יודע שיש בך יותר...                 [▲][▼][🗑]│  │
│  │  ├── 2. דפוסים חוזרים...                        [▲][▼][🗑]│  │
│  │  └── 3. מרגיש תקוע...                           [▲][▼][🗑]│  │
│  │                                                            │  │
│  │  שלבי התהליך (Process Steps)                        [+]  │  │
│  │  ├── 1. שיחת הכרות                              [▲][▼][🗑]│  │
│  │  ├── 2. מיפוי עומק                              [▲][▼][🗑]│  │
│  │  └── 3. תוכנית פעולה                            [▲][▼][🗑]│  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [ביטול]                                    [שמור] [שמור ופרסם] │
└─────────────────────────────────────────────────────────────────┘
```

### 4. תבניות ברירת מחדל

**Template: Homepage**
- Hero with portrait + rotating words
- 3 product cards (Introspection, Personal Hypnosis, Consciousness Leap)
- About section
- Testimonials
- FAQ
- Footer

**Template: Product**
- Hero with badge + CTA
- Pain Points (3 cards)
- How It Works / Process Steps
- What's Included / Benefits
- For Who / Not For Who
- Testimonials
- FAQ
- Final CTA

**Template: Lead Capture**
- Hero with form
- Value proposition
- Trust badges
- Simple form

### 5. קומפוננטת DynamicLandingPage

קומפוננטה גנרית שמקבלת slug ומרנדרת את הדף לפי הנתונים מהדאטאבייס:

```tsx
// src/pages/DynamicLandingPage.tsx
const DynamicLandingPage = () => {
  const { slug } = useParams();
  const { data: page } = useQuery(['landing-page', slug], ...);
  
  return (
    <div>
      <Header brandColors={getColors(page.brand_color)} />
      
      {page.sections_order.map(sectionKey => {
        switch(sectionKey) {
          case 'hero': return <HeroSection data={page} />;
          case 'pain_points': return <PainPointsSection data={page.pain_points} />;
          case 'process': return <ProcessSection data={page.process_steps} />;
          case 'benefits': return <BenefitsSection data={page.benefits} />;
          case 'testimonials': return <TestimonialsSection data={page.testimonials} />;
          case 'faq': return <FAQSection data={page.faqs} />;
          case 'cta': return <CTASection data={page} />;
        }
      })}
      
      <Footer />
    </div>
  );
};
```

---

## שינויים טכניים

### Phase 1: Database

1. יצירת טבלת `landing_pages`
2. מיגרציה של הנתונים הקיימים מ-Offers + הוספת נתוני ברירת מחדל לדפים הקיימים
3. RLS policies

### Phase 2: Admin UI

1. עדכון AdminSidebar - הוספת "דפי נחיתה" לקבוצת Site
2. יצירת `src/pages/admin/LandingPages.tsx`
3. יצירת `src/components/admin/landing/LandingPageDialog.tsx`
4. יצירת `src/components/admin/landing/SectionEditor.tsx`

### Phase 3: Frontend Components

1. יצירת `src/components/landing/DynamicHero.tsx`
2. יצירת `src/components/landing/DynamicPainPoints.tsx`
3. יצירת `src/components/landing/DynamicProcess.tsx`
4. יצירת `src/components/landing/DynamicBenefits.tsx`
5. יצירת `src/components/landing/DynamicTestimonials.tsx`
6. יצירת `src/components/landing/DynamicFAQ.tsx`
7. יצירת `src/components/landing/DynamicCTA.tsx`
8. יצירת `src/pages/DynamicLandingPage.tsx`

### Phase 4: Routing

עדכון App.tsx להוספת route דינמי:
```tsx
<Route path="/lp/:slug" element={<DynamicLandingPage />} />
```

---

## שאלה

האם אתה רוצה:
1. **גישה מלאה** - טבלה חדשה + כל הקומפוננטות הדינמיות + עורך ויזואלי מלא
2. **גישה פשוטה** - להשתמש בטבלת Offers הקיימת ורק להוסיף דף אדמין שמנהל את השדות הקיימים בצורה יותר נוחה

הגישה הפשוטה מהירה יותר ומשתמשת במה שכבר קיים.
