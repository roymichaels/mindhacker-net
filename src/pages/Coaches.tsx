/**
 * Coaches page — now directly renders the unified CareerHub for coaches.
 * No more "Find a Coach / Become a Coach" decision screen.
 */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCoachSubscription } from '@/hooks/useCoachSubscription';
import { useUserRoles } from '@/hooks/useUserRoles';
import { toast } from 'sonner';
import CareerHub from './CareerHub';

export default function Coaches() {
  const [searchParams, setSearchParams] = useSearchParams();
  const checkoutStatus = searchParams.get('checkout');
  const { refetch: refetchCoachSub } = useCoachSubscription();
  const { refetch: refetchRoles } = useUserRoles();

  useEffect(() => {
    if (checkoutStatus === 'success') {
      toast.success('Subscription activated! Setting up your coach profile...');
      const interval = setInterval(async () => {
        const { data } = await refetchCoachSub();
        if (data?.subscribed) {
          await refetchRoles();
          clearInterval(interval);
          setSearchParams({});
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [checkoutStatus]);

  return <CareerHub careerPath="coach" />;
}
