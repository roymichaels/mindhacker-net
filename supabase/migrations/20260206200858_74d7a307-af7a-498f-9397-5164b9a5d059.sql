
-- 1. Create practitioner_availability table
CREATE TABLE public.practitioner_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID REFERENCES public.practitioners(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Validation trigger for day_of_week
CREATE OR REPLACE FUNCTION public.validate_day_of_week()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.day_of_week < 0 OR NEW.day_of_week > 6 THEN
    RAISE EXCEPTION 'day_of_week must be between 0 and 6';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER check_day_of_week
BEFORE INSERT OR UPDATE ON public.practitioner_availability
FOR EACH ROW EXECUTE FUNCTION public.validate_day_of_week();

ALTER TABLE public.practitioner_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active availability"
ON public.practitioner_availability FOR SELECT
USING (is_active = true);

CREATE POLICY "Practitioners can manage own availability"
ON public.practitioner_availability FOR ALL
USING (practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid()));

-- 2. Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID REFERENCES public.practitioners(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.practitioner_services(id),
  client_user_id UUID NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Validation trigger for status
CREATE OR REPLACE FUNCTION public.validate_booking_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'confirmed', 'cancelled', 'completed') THEN
    RAISE EXCEPTION 'Invalid booking status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER check_booking_status
BEFORE INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.validate_booking_status();

-- Updated_at trigger
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own bookings"
ON public.bookings FOR SELECT
USING (client_user_id = auth.uid());

CREATE POLICY "Practitioners can view their bookings"
ON public.bookings FOR SELECT
USING (practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can create bookings"
ON public.bookings FOR INSERT
WITH CHECK (auth.uid() = client_user_id);

CREATE POLICY "Clients can update own bookings"
ON public.bookings FOR UPDATE
USING (client_user_id = auth.uid());

CREATE POLICY "Practitioners can update their bookings"
ON public.bookings FOR UPDATE
USING (practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid()));
