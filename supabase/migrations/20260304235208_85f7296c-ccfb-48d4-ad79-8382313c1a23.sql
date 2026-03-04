-- Allow authenticated users to insert their own wallet row
CREATE POLICY "Users create own wallet"
ON public.fm_wallets
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Backfill: create wallet rows for all existing users who don't have one
INSERT INTO public.fm_wallets (user_id)
SELECT p.id FROM public.profiles p
LEFT JOIN public.fm_wallets w ON w.user_id = p.id
WHERE w.id IS NULL;