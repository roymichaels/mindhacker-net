// Product brand colors utility for data-driven theming
// Maps color identifiers to Tailwind CSS classes
// Supports "theme" option that uses CSS variables from theme_settings

export type ProductColorKey = 'theme' | 'primary' | 'emerald' | 'purple' | 'fuchsia' | 'amber' | 'rose' | 'blue';

export interface ProductColorClasses {
  border: string;
  borderHover: string;
  bg: string;
  bgLight: string;
  bgMedium: string;
  text: string;
  button: string;
  buttonText: string;
  shadow: string;
  gradient: string;
}

export const productColorClasses: Record<ProductColorKey, ProductColorClasses> = {
  // Theme uses CSS variables from database-driven theme_settings
  theme: {
    border: 'border-primary',
    borderHover: 'hover:border-primary/60',
    bg: 'bg-primary',
    bgLight: 'bg-primary/10',
    bgMedium: 'bg-primary/20',
    text: 'text-primary',
    button: 'bg-primary hover:bg-primary/90',
    buttonText: 'text-primary-foreground',
    shadow: 'shadow-primary/25',
    gradient: 'from-primary/10'
  },
  primary: {
    border: 'border-primary',
    borderHover: 'hover:border-primary/60',
    bg: 'bg-primary',
    bgLight: 'bg-primary/10',
    bgMedium: 'bg-primary/20',
    text: 'text-primary',
    button: 'bg-primary hover:bg-primary/90',
    buttonText: 'text-primary-foreground',
    shadow: 'shadow-primary/25',
    gradient: 'from-primary/10'
  },
  emerald: {
    border: 'border-emerald-500',
    borderHover: 'hover:border-emerald-500/60',
    bg: 'bg-emerald-500',
    bgLight: 'bg-emerald-500/10',
    bgMedium: 'bg-emerald-500/20',
    text: 'text-emerald-500',
    button: 'bg-emerald-500 hover:bg-emerald-600',
    buttonText: 'text-white',
    shadow: 'shadow-emerald-500/25',
    gradient: 'from-emerald-500/10'
  },
  purple: {
    border: 'border-purple-500',
    borderHover: 'hover:border-purple-500/60',
    bg: 'bg-purple-600',
    bgLight: 'bg-purple-500/10',
    bgMedium: 'bg-purple-500/20',
    text: 'text-purple-500',
    button: 'bg-purple-600 hover:bg-purple-700',
    buttonText: 'text-white',
    shadow: 'shadow-purple-500/25',
    gradient: 'from-purple-500/10'
  },
  fuchsia: {
    border: 'border-fuchsia-500',
    borderHover: 'hover:border-fuchsia-500/60',
    bg: 'bg-fuchsia-500',
    bgLight: 'bg-fuchsia-500/10',
    bgMedium: 'bg-fuchsia-500/20',
    text: 'text-fuchsia-500',
    button: 'bg-fuchsia-500 hover:bg-fuchsia-600',
    buttonText: 'text-white',
    shadow: 'shadow-fuchsia-500/25',
    gradient: 'from-fuchsia-500/10'
  },
  amber: {
    border: 'border-amber-500',
    borderHover: 'hover:border-amber-500/60',
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-500/10',
    bgMedium: 'bg-amber-500/20',
    text: 'text-amber-500',
    button: 'bg-amber-500 hover:bg-amber-600',
    buttonText: 'text-white',
    shadow: 'shadow-amber-500/25',
    gradient: 'from-amber-500/10'
  },
  rose: {
    border: 'border-rose-500',
    borderHover: 'hover:border-rose-500/60',
    bg: 'bg-rose-500',
    bgLight: 'bg-rose-500/10',
    bgMedium: 'bg-rose-500/20',
    text: 'text-rose-500',
    button: 'bg-rose-500 hover:bg-rose-600',
    buttonText: 'text-white',
    shadow: 'shadow-rose-500/25',
    gradient: 'from-rose-500/10'
  },
  blue: {
    border: 'border-blue-500',
    borderHover: 'hover:border-blue-500/60',
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-500/10',
    bgMedium: 'bg-blue-500/20',
    text: 'text-blue-500',
    button: 'bg-blue-500 hover:bg-blue-600',
    buttonText: 'text-white',
    shadow: 'shadow-blue-500/25',
    gradient: 'from-blue-500/10'
  }
};

// Get product colors - returns theme colors if null/undefined
export const getProductColors = (colorKey: string | null | undefined): ProductColorClasses => {
  if (!colorKey) {
    return productColorClasses.theme;
  }
  const key = colorKey as ProductColorKey;
  return productColorClasses[key] || productColorClasses.theme;
};

// Alias for offers - same logic, different name for clarity
export const getOfferColors = getProductColors;

// Color options for admin UI with labels (includes theme option first)
export const colorOptions: { value: ProductColorKey | null; labelHe: string; labelEn: string; preview: string }[] = [
  { value: null, labelHe: 'ברירת מחדל (צבע ראשי)', labelEn: 'Default (Theme Primary)', preview: 'bg-primary' },
  { value: 'fuchsia', labelHe: 'פוקסיה (ורוד)', labelEn: 'Fuchsia (Pink)', preview: 'bg-fuchsia-500' },
  { value: 'purple', labelHe: 'סגול', labelEn: 'Purple', preview: 'bg-purple-500' },
  { value: 'amber', labelHe: 'ענבר (זהב)', labelEn: 'Amber (Gold)', preview: 'bg-amber-500' },
  { value: 'emerald', labelHe: 'אמרלד (ירוק)', labelEn: 'Emerald (Green)', preview: 'bg-emerald-500' },
  { value: 'rose', labelHe: 'ורד', labelEn: 'Rose', preview: 'bg-rose-500' },
  { value: 'blue', labelHe: 'כחול', labelEn: 'Blue', preview: 'bg-blue-500' },
];
