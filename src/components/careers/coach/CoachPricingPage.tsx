/**
 * Coach Pricing — tiered subscription cards with coupon support.
 * Starter $19/mo (10 clients), Growth $49/mo (100 clients), Scale $99/mo (500 clients)
 */
import { useState } from 'react';
import { Check, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const TIERS = [
  {
    id: 'starter',
    nameEn: 'Starter',
    nameHe: 'סטארטר',
    price: 19,
    clients: 10,
    priceId: 'price_1T74WWL9lVJ44TbRziR03haW',
    featuresEn: ['Up to 10 clients', 'AI plan builder', 'Basic analytics', 'Landing page builder'],
    featuresHe: ['עד 10 מתאמנים', 'בונה תוכניות AI', 'אנליטיקס בסיסי', 'בונה דפי נחיתה'],
  },
  {
    id: 'growth',
    nameEn: 'Growth',
    nameHe: 'צמיחה',
    price: 49,
    clients: 100,
    priceId: 'price_1T74WqL9lVJ44TbRx0uGMNOY',
    popular: true,
    featuresEn: ['Up to 100 clients', 'Everything in Starter', 'Advanced analytics', 'Marketing tools', 'Lead management'],
    featuresHe: ['עד 100 מתאמנים', 'הכל בסטארטר', 'אנליטיקס מתקדם', 'כלי שיווק', 'ניהול לידים'],
  },
  {
    id: 'scale',
    nameEn: 'Scale',
    nameHe: 'סקייל',
    price: 99,
    clients: 500,
    priceId: 'price_1T74XEL9lVJ44TbR8R5h76R9',
    featuresEn: ['Up to 500 clients', 'Everything in Growth', 'Priority support', 'White-label options', 'Team management'],
    featuresHe: ['עד 500 מתאמנים', 'הכל בצמיחה', 'תמיכה עדיפות', 'מיתוג אישי', 'ניהול צוות'],
  },
];

interface CoachPricingPageProps {
  onBack?: () => void;
}

export default function CoachPricingPage({ onBack }: CoachPricingPageProps) {
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isHe = language === 'he';
  const [couponCode, setCouponCode] = useState('');
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleCheckout = async (tier: typeof TIERS[0]) => {
    if (!user) { navigate('/auth'); return; }
    setLoadingTier(tier.id);
    try {
      const { data, error } = await supabase.functions.invoke('create-coach-checkout', {
        body: { priceId: tier.priceId, couponCode: couponCode.trim() || undefined },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {onBack && (
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {isHe ? 'חזרה' : 'Back'}
        </Button>
      )}

      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold">
          {isHe ? 'הפכו למאמנים על הפלטפורמה' : 'Become a Coach on the Platform'}
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          {isHe
            ? 'בחרו את התוכנית שמתאימה לעסק שלכם והתחילו לנהל מתאמנים עוד היום'
            : 'Choose the plan that fits your business and start managing clients today'}
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {TIERS.map((tier, i) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "relative rounded-2xl border bg-card p-6 space-y-5 flex flex-col",
              tier.popular && "border-amber-500/50 ring-2 ring-amber-500/20"
            )}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {isHe ? 'הכי פופולרי' : 'Most Popular'}
              </div>
            )}

            <div>
              <h3 className="text-xl font-bold">{isHe ? tier.nameHe : tier.nameEn}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold">${tier.price}</span>
                <span className="text-muted-foreground">/{isHe ? 'חודש' : 'mo'}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {isHe ? `עד ${tier.clients} מתאמנים` : `Up to ${tier.clients} clients`}
              </p>
            </div>

            <ul className="space-y-2 flex-1">
              {(isHe ? tier.featuresHe : tier.featuresEn).map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleCheckout(tier)}
              disabled={!!loadingTier}
              className={cn(
                "w-full",
                tier.popular
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  : ""
              )}
              variant={tier.popular ? "default" : "outline"}
            >
              {loadingTier === tier.id
                ? (isHe ? 'טוען...' : 'Loading...')
                : (isHe ? 'התחל עכשיו' : 'Get Started')}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Coupon Input */}
      <div className="max-w-sm mx-auto space-y-2">
        <label className="text-sm text-muted-foreground block text-center">
          {isHe ? 'יש לך קוד קופון?' : 'Have a coupon code?'}
        </label>
        <Input
          placeholder={isHe ? 'הכנס קוד קופון' : 'Enter coupon code'}
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          className="text-center"
        />
      </div>
    </div>
  );
}
