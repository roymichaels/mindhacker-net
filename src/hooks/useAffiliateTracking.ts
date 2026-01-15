import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AFFILIATE_STORAGE_KEY = 'affiliate_code';
const AFFILIATE_EXPIRY_KEY = 'affiliate_code_expiry';
const AFFILIATE_EXPIRY_DAYS = 30;

export const useAffiliateTracking = () => {
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
      
      console.log('Affiliate code saved:', refCode);
    }
  }, [location.search]);
};

export const getStoredAffiliateCode = (): string | null => {
  const code = localStorage.getItem(AFFILIATE_STORAGE_KEY);
  const expiry = localStorage.getItem(AFFILIATE_EXPIRY_KEY);

  if (!code || !expiry) return null;

  // Check if expired
  if (new Date() > new Date(expiry)) {
    clearAffiliateCode();
    return null;
  }

  return code;
};

export const clearAffiliateCode = () => {
  localStorage.removeItem(AFFILIATE_STORAGE_KEY);
  localStorage.removeItem(AFFILIATE_EXPIRY_KEY);
};
