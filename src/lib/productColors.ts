// Product brand colors utility for data-driven theming
// Maps color identifiers to Tailwind CSS classes

export type ProductColorKey = 'primary' | 'emerald' | 'purple' | 'amber' | 'rose' | 'blue';

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

export const getProductColors = (colorKey: string | null | undefined): ProductColorClasses => {
  const key = colorKey as ProductColorKey;
  return productColorClasses[key] || productColorClasses.primary;
};

// Color options for admin UI with labels
export const colorOptions: { value: ProductColorKey; labelHe: string; labelEn: string; preview: string }[] = [
  { value: 'primary', labelHe: 'ראשי (ציאן)', labelEn: 'Primary (Cyan)', preview: 'bg-primary' },
  { value: 'emerald', labelHe: 'אמרלד (ירוק)', labelEn: 'Emerald (Green)', preview: 'bg-emerald-500' },
  { value: 'purple', labelHe: 'סגול (אינדיגו)', labelEn: 'Purple (Indigo)', preview: 'bg-purple-500' },
  { value: 'amber', labelHe: 'ענבר (זהב)', labelEn: 'Amber (Gold)', preview: 'bg-amber-500' },
  { value: 'rose', labelHe: 'ורוד', labelEn: 'Rose (Pink)', preview: 'bg-rose-500' },
  { value: 'blue', labelHe: 'כחול', labelEn: 'Blue', preview: 'bg-blue-500' },
];
