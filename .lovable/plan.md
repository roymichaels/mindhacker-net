

# תוכנית: הפיכת Mind Hacker לפלטפורמת מאמנים

## סקירה כללית

המעבר מאפליקציה אישית של דין → **פלטפורמת התפתחות אישית מבוססת AI** עם מאמני תודעה והיפנוטרפיסטים מרובים.

```text
לפני:                                    אחרי:
┌─────────────────────────┐             ┌──────────────────────────────────────┐
│  Mind Hacker            │             │  Mind Hacker Platform                │
│  ─────────────────────  │             │  ───────────────────────────────     │
│  • Dean - מייסד יחיד    │      →      │  • Aurora AI - הליבה                 │
│  • כל התוכן מקושר לדין  │             │  • Directory מאמנים/מטפלים          │
│  • אין הפרדה מאמן/תוכן   │             │  • Dean - מאמן ראשון בפלטפורמה       │
│                         │             │  • מבנה Multi-practitioner           │
└─────────────────────────┘             └──────────────────────────────────────┘
```

---

## ארכיטקטורה החדשה

### שכבות המערכת

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        MIND HACKER PLATFORM                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                      🧠 AURORA AI LAYER                        │ │
│  │  • מאמן AI אישי לכל משתמש                                      │ │
│  │  • Launchpad + Life Plans                                      │ │
│  │  • Hypnosis AI                                                 │ │
│  │  • Gamification                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │               👥 PRACTITIONER DIRECTORY                        │ │
│  │  • רשימת מאמנים/מטפלים                                        │ │
│  │  • פרופילים אישיים                                             │ │
│  │  • שירותים והתמחויות                                          │ │
│  │  • הזמנת פגישות                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─────────────────────────┐  ┌─────────────────────────────────┐ │
│  │   🎓 CONTENT            │  │   🏪 MARKETPLACE                 │ │
│  │   • קורסים              │  │   • מוצרים של מאמנים            │ │
│  │   • סדרות              │  │   • היפנוזות אישיות              │ │
│  │   • ספריית משאבים       │  │   • תהליכי ליווי                │ │
│  └─────────────────────────┘  └─────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## סכמת Database חדשה

### 1. טבלת מאמנים/מטפלים (practitioners)

```sql
CREATE TABLE practitioners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic Info
  display_name TEXT NOT NULL,
  display_name_en TEXT,
  title TEXT NOT NULL,                -- "מאמן תודעה", "היפנוטרפיסט"
  title_en TEXT,
  short_name TEXT,
  short_name_en TEXT,
  bio TEXT,
  bio_en TEXT,
  
  -- Media
  avatar_url TEXT,
  hero_image_url TEXT,
  intro_video_url TEXT,
  
  -- Contact & Social
  whatsapp TEXT,
  calendly_url TEXT,
  instagram_url TEXT,
  website_url TEXT,
  
  -- Location & Availability
  country TEXT DEFAULT 'Israel',
  languages TEXT[] DEFAULT '{"he"}',
  timezone TEXT DEFAULT 'Asia/Jerusalem',
  
  -- Platform settings
  slug TEXT UNIQUE NOT NULL,          -- URL: /practitioner/dean
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  
  -- Commission (for future marketplace)
  commission_rate DECIMAL DEFAULT 20, -- Platform takes 20%
  
  -- Stats
  clients_count INTEGER DEFAULT 0,
  rating DECIMAL DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. התמחויות והסמכות (practitioner_specialties)

```sql
CREATE TABLE practitioner_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID REFERENCES practitioners(id) ON DELETE CASCADE NOT NULL,
  specialty TEXT NOT NULL,            -- "hypnotherapy", "coaching", "nlp"
  specialty_label TEXT NOT NULL,      -- "היפנותרפיה"
  specialty_label_en TEXT,
  years_experience INTEGER DEFAULT 0,
  certification_name TEXT,            -- "תעודת NLP מוסמך"
  certification_url TEXT,             -- לינק לתעודה
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. שירותים של מאמנים (practitioner_services)

```sql
CREATE TABLE practitioner_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID REFERENCES practitioners(id) ON DELETE CASCADE NOT NULL,
  
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  
  service_type TEXT NOT NULL,         -- "session", "package", "product"
  price DECIMAL NOT NULL,
  price_currency TEXT DEFAULT 'ILS',
  
  duration_minutes INTEGER,           -- למפגשים
  sessions_count INTEGER,             -- לחבילות
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. עדכון app_role enum

```sql
-- הוספת role חדש למאמנים
ALTER TYPE app_role ADD VALUE 'practitioner';
```

---

## מבנה הדפים החדש

### דפים ציבוריים

| נתיב | תיאור |
|------|-------|
| `/` | דף בית - Aurora + רשימת מאמנים |
| `/practitioners` | מאגר מאמנים ומטפלים |
| `/practitioner/:slug` | פרופיל מאמן (למשל /practitioner/dean) |
| `/practitioner/:slug/book` | הזמנת פגישה עם מאמן |
| `/aurora` | Aurora AI (נשאר כמו שהוא) |

### דפי מאמן (Practitioner Dashboard)

| נתיב | תיאור |
|------|-------|
| `/my-practice` | דשבורד מאמן |
| `/my-practice/clients` | רשימת לקוחות |
| `/my-practice/calendar` | יומן פגישות |
| `/my-practice/services` | ניהול שירותים |
| `/my-practice/products` | מוצרים שלי |
| `/my-practice/earnings` | הכנסות ועמלות |
| `/my-practice/profile` | עריכת פרופיל |

---

## עדכונים לקוד קיים

### 1. שינויים בדף הבית (Index.tsx)

**לפני:**
- HeroSection עם דין
- About עם סיפור אישי של דין
- IntrospectionPromo / PersonalVideoPromo / ConsciousnessLeapPromo

**אחרי:**
- HeroSection - Platform-focused (Aurora AI + מציאת מאמן)
- FeaturedPractitioners - מאמנים מומלצים
- HowItWorks - כיצד הפלטפורמה עובדת
- Aurora Promo - הדגשת הליווי ה-AI
- Testimonials - מכלל המאמנים

### 2. Theme Settings - מ-founder לplatform

**לפני:**
```typescript
founder_name: string;
founder_name_en: string;
founder_title: string;
```

**אחרי:**
```typescript
// Platform info (נשאר)
brand_name: string;
brand_name_en: string;

// Founder info (נשאר להיסטוריה/SEO)
founder_name: string;
founder_name_en: string;

// כל מאמן יש לו פרופיל נפרד בטבלת practitioners
```

### 3. שינויים ב-Aurora Chat System Prompt

**לפני:**
```
אתה העוזר האישי של דין אושר אזולאי מאתר מיינד-האקר.
```

**אחרי:**
```
אני Aurora - מערכת הליווי האישי של פלטפורמת Mind Hacker.
אני עוזרת למשתמשים למצוא את דרכם, לבנות תוכנית התפתחות אישית,
ולהתאים להם מאמן או מטפל במידת הצורך.
```

### 4. Products → קישור למאמן

```sql
ALTER TABLE products 
ADD COLUMN practitioner_id UUID REFERENCES practitioners(id);
```

### 5. Orders → קישור למאמן

```sql
ALTER TABLE orders 
ADD COLUMN practitioner_id UUID REFERENCES practitioners(id);
```

---

## Dean כמאמן ראשון

### Seed Data - יצירת פרופיל דין

```sql
-- יצירת Dean כמאמן ראשון
INSERT INTO practitioners (
  user_id,
  display_name,
  display_name_en,
  title,
  title_en,
  short_name,
  short_name_en,
  bio,
  bio_en,
  slug,
  is_featured,
  is_verified,
  status,
  country,
  languages,
  whatsapp,
  calendly_url,
  instagram_url
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'dean@mindhacker.net'),
  'דין אושר אזולאי',
  'Dean Osher Azulay',
  'מאמן תודעה | מייסד Mind Hacker',
  'Consciousness Coach | Mind Hacker Founder',
  'דין',
  'Dean',
  'סיפור אישי כאן...',
  'Personal story here...',
  'dean',
  true,
  true,
  'active',
  'International',
  '{"he", "en"}',
  -- WhatsApp, Calendly from site_settings
  NULL,
  NULL,
  NULL
);
```

---

## קומפוננטות חדשות

| קומפוננטה | תיאור |
|-----------|--------|
| `PractitionerCard.tsx` | כרטיס מאמן ברשימה |
| `PractitionerProfile.tsx` | עמוד פרופיל מלא |
| `PractitionerDirectory.tsx` | דף רשימת מאמנים |
| `PractitionerServices.tsx` | רשימת שירותים של מאמן |
| `PractitionerBooking.tsx` | מודל הזמנת פגישה |
| `FeaturedPractitioners.tsx` | רכיב מאמנים מומלצים |

---

## שלבי יישום

### שלב 1: תשתית (Database + Types)
- [ ] יצירת טבלאות practitioners, practitioner_specialties, practitioner_services
- [ ] עדכון app_role enum
- [ ] הוספת practitioner_id לטבלאות קיימות
- [ ] יצירת RLS policies

### שלב 2: Dean כמאמן ראשון
- [ ] יצירת פרופיל Dean
- [ ] העברת נתונים מ-theme_settings לפרופיל
- [ ] קישור מוצרים קיימים לדין

### שלב 3: דף פרופיל מאמן
- [ ] יצירת `/practitioner/:slug`
- [ ] הצגת פרופיל, שירותים, ביקורות
- [ ] כפתור הזמנת פגישה

### שלב 4: מאגר מאמנים
- [ ] יצירת `/practitioners`
- [ ] פילטרים (התמחות, שפה, מדינה)
- [ ] חיפוש

### שלב 5: דשבורד מאמן
- [ ] יצירת `/my-practice`
- [ ] ניהול לקוחות, שירותים, הכנסות
- [ ] עריכת פרופיל

### שלב 6: עדכון דף הבית
- [ ] HeroSection חדש (Platform-focused)
- [ ] FeaturedPractitioners section
- [ ] עדכון ניווט

### שלב 7: עדכון Aurora
- [ ] System prompt platform-oriented
- [ ] יכולת להמליץ על מאמנים
- [ ] אינטגרציה עם Directory

---

## Migration Path

```text
Phase 1: Foundation               Phase 2: Features              Phase 3: Scale
─────────────────────            ─────────────────              ─────────────
• DB Schema                      • Practitioner UI              • More practitioners
• Dean profile                   • Booking system               • Payment split
• Basic routing                  • Reviews system               • Analytics
• RLS policies                   • Aurora integration           • Marketing tools
```

---

## סיכום טכני

| פריט | כמות |
|------|------|
| טבלאות DB חדשות | 3 |
| עמודות חדשות בטבלאות קיימות | 4 |
| דפים חדשים | 8 |
| קומפוננטות חדשות | 6 |
| עדכונים ל-Edge functions | 2 |
| Roles חדשים | 1 (practitioner) |

