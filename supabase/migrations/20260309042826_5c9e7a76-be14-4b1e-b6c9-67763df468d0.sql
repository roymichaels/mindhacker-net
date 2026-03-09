-- Delete all seed/example bounty claims first (FK dependency)
DELETE FROM public.fm_bounty_claims WHERE bounty_id IN (SELECT id FROM public.fm_bounties);

-- Delete all seed bounties
DELETE FROM public.fm_bounties;

-- Delete all seed gig proposals first (FK dependency)
DELETE FROM public.fm_gig_proposals WHERE gig_id IN (SELECT id FROM public.fm_gigs);

-- Delete all seed gigs
DELETE FROM public.fm_gigs;