import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { debug } from '@/lib/debug';

const AFFILIATE_STORAGE_KEY = 'affiliate_code';
const AFFILIATE_EXPIRY_KEY = 'affiliate_code_expiry';
const AFFILIATE_EXPIRY_DAYS = 30;

/**
 * Get the stored affiliate code from localStorage
 * Returns null if expired or not found
 */
export const getStoredAffiliateCode = (): string | null => {
  try {
    const code = localStorage.getItem(AFFILIATE_STORAGE_KEY);
    const expiry = localStorage.getItem(AFFILIATE_EXPIRY_KEY);

    if (!code || !expiry) return null;

    // Check if expired
    if (new Date() > new Date(expiry)) {
      clearAffiliateCode();
      return null;
    }

    return code;
  } catch {
    return null;
  }
};

/**
 * Clear the affiliate code from localStorage
 */
export const clearAffiliateCode = () => {
  try {
    localStorage.removeItem(AFFILIATE_STORAGE_KEY);
    localStorage.removeItem(AFFILIATE_EXPIRY_KEY);
  } catch {
    // Ignore localStorage errors
  }
};

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
      try {
        // Save affiliate code to localStorage with expiry
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + AFFILIATE_EXPIRY_DAYS);
        
        localStorage.setItem(AFFILIATE_STORAGE_KEY, refCode);
        localStorage.setItem(AFFILIATE_EXPIRY_KEY, expiryDate.toISOString());
        
        debug.log('Affiliate code tracked:', refCode);
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [location.search]);

  // This component doesn't render anything
  return null;
};

export default AffiliateTracker;
