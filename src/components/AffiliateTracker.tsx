import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AFFILIATE_STORAGE_KEY = 'affiliate_code';
const AFFILIATE_EXPIRY_KEY = 'affiliate_code_expiry';
const AFFILIATE_EXPIRY_DAYS = 30;

/**
 * Global affiliate tracking component that detects ?ref= parameter on any page
 * and stores it in localStorage for 30 days
 */
const AffiliateTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');

    if (refCode) {
      // Save affiliate code to localStorage with expiry
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + AFFILIATE_EXPIRY_DAYS);
      
      localStorage.setItem(AFFILIATE_STORAGE_KEY, refCode);
      localStorage.setItem(AFFILIATE_EXPIRY_KEY, expiryDate.toISOString());
      
      console.log('Affiliate code tracked:', refCode);
    }
  }, [location.search]);

  // This component doesn't render anything
  return null;
};

export default AffiliateTracker;
