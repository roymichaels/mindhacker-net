/**
 * Business Orb System - Visual DNA generation for businesses
 * Maps business journey data to unique visual identities
 */

export type BusinessIndustry = 
  | 'tech'
  | 'creative'
  | 'health'
  | 'finance'
  | 'retail'
  | 'education'
  | 'consulting'
  | 'other';

export type BusinessModel = 
  | 'service'
  | 'product'
  | 'hybrid'
  | 'saas'
  | 'marketplace';

export interface BusinessOrbProfile {
  primaryColor: string;
  secondaryColors: string[];
  accentColor: string;
  glowColor: string;
  morphIntensity: number;
  morphSpeed: number;
  geometryDetail: number;
  particleEnabled: boolean;
  particleCount: number;
  industry: BusinessIndustry;
  model: BusinessModel;
  maturity: number; // 0-100 based on journey progress
}

// Industry-based color palettes
export const INDUSTRY_PALETTES: Record<BusinessIndustry, {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
}> = {
  tech: {
    primary: 'hsl(187, 85%, 45%)',    // Cyan
    secondary: 'hsl(271, 81%, 50%)',   // Purple
    accent: 'hsl(200, 90%, 55%)',      // Bright blue
    glow: 'hsl(187, 100%, 60%)',
  },
  creative: {
    primary: 'hsl(300, 76%, 50%)',     // Magenta
    secondary: 'hsl(187, 85%, 50%)',   // Cyan
    accent: 'hsl(320, 80%, 55%)',      // Pink
    glow: 'hsl(300, 90%, 65%)',
  },
  health: {
    primary: 'hsl(168, 70%, 45%)',     // Teal
    secondary: 'hsl(300, 60%, 50%)',   // Magenta
    accent: 'hsl(150, 65%, 50%)',      // Green
    glow: 'hsl(168, 80%, 55%)',
  },
  finance: {
    primary: 'hsl(45, 90%, 50%)',      // Gold
    secondary: 'hsl(187, 75%, 45%)',   // Cyan
    accent: 'hsl(38, 95%, 55%)',       // Amber
    glow: 'hsl(45, 100%, 60%)',
  },
  retail: {
    primary: 'hsl(25, 90%, 55%)',      // Orange
    secondary: 'hsl(271, 70%, 50%)',   // Purple
    accent: 'hsl(15, 85%, 50%)',       // Red-orange
    glow: 'hsl(25, 95%, 60%)',
  },
  education: {
    primary: 'hsl(271, 75%, 55%)',     // Purple
    secondary: 'hsl(187, 80%, 50%)',   // Cyan
    accent: 'hsl(260, 70%, 60%)',      // Indigo
    glow: 'hsl(271, 85%, 65%)',
  },
  consulting: {
    primary: 'hsl(210, 70%, 50%)',     // Blue
    secondary: 'hsl(45, 80%, 50%)',    // Gold
    accent: 'hsl(220, 75%, 55%)',      // Royal blue
    glow: 'hsl(210, 80%, 60%)',
  },
  other: {
    primary: 'hsl(45, 85%, 50%)',      // Default gold (business theme)
    secondary: 'hsl(35, 80%, 45%)',    // Amber
    accent: 'hsl(55, 90%, 55%)',       // Yellow
    glow: 'hsl(45, 95%, 60%)',
  },
};

// Business model affects morphology
const MODEL_MORPHOLOGY: Record<BusinessModel, {
  morphIntensity: number;
  morphSpeed: number;
  geometryDetail: number;
}> = {
  service: {
    morphIntensity: 0.2,    // Flowing, adaptive
    morphSpeed: 0.8,
    geometryDetail: 5,
  },
  product: {
    morphIntensity: 0.1,    // More angular, stable
    morphSpeed: 0.6,
    geometryDetail: 4,
  },
  hybrid: {
    morphIntensity: 0.15,   // Balanced
    morphSpeed: 0.7,
    geometryDetail: 5,
  },
  saas: {
    morphIntensity: 0.18,   // Tech-forward, dynamic
    morphSpeed: 0.9,
    geometryDetail: 6,
  },
  marketplace: {
    morphIntensity: 0.12,   // Multi-faceted
    morphSpeed: 0.75,
    geometryDetail: 5,
  },
};

/**
 * Detect industry from business journey data
 */
export function detectIndustry(journeyData: {
  step_2_business_model?: { industry?: string; type?: string } | null;
  step_1_vision?: { description?: string; keywords?: string[] } | null;
}): BusinessIndustry {
  const modelData = journeyData.step_2_business_model;
  
  if (modelData?.industry) {
    const industry = modelData.industry.toLowerCase();
    
    if (industry.includes('tech') || industry.includes('software') || industry.includes('saas')) {
      return 'tech';
    }
    if (industry.includes('creative') || industry.includes('design') || industry.includes('art')) {
      return 'creative';
    }
    if (industry.includes('health') || industry.includes('wellness') || industry.includes('medical')) {
      return 'health';
    }
    if (industry.includes('finance') || industry.includes('banking') || industry.includes('investment')) {
      return 'finance';
    }
    if (industry.includes('retail') || industry.includes('ecommerce') || industry.includes('shop')) {
      return 'retail';
    }
    if (industry.includes('education') || industry.includes('training') || industry.includes('coaching')) {
      return 'education';
    }
    if (industry.includes('consult') || industry.includes('advisory') || industry.includes('strategy')) {
      return 'consulting';
    }
  }
  
  return 'other';
}

/**
 * Detect business model type
 */
export function detectBusinessModel(journeyData: {
  step_2_business_model?: { type?: string; model?: string } | null;
}): BusinessModel {
  const modelData = journeyData.step_2_business_model;
  
  if (modelData?.type || modelData?.model) {
    const type = (modelData.type || modelData.model || '').toLowerCase();
    
    if (type.includes('service')) return 'service';
    if (type.includes('product')) return 'product';
    if (type.includes('saas') || type.includes('subscription')) return 'saas';
    if (type.includes('marketplace') || type.includes('platform')) return 'marketplace';
    if (type.includes('hybrid') || type.includes('both')) return 'hybrid';
  }
  
  return 'service'; // Default
}

/**
 * Calculate business maturity based on journey progress
 */
export function calculateMaturity(currentStep: number, isComplete: boolean): number {
  if (isComplete) return 100;
  return Math.round((currentStep - 1) / 10 * 100);
}

/**
 * Generate a complete business orb profile from journey data
 */
export function generateBusinessOrbProfile(journeyData: {
  id?: string;
  business_name?: string | null;
  current_step: number;
  journey_complete: boolean;
  step_1_vision?: unknown;
  step_2_business_model?: unknown;
}): BusinessOrbProfile {
  const industry = detectIndustry({
    step_1_vision: journeyData.step_1_vision as { description?: string; keywords?: string[] } | null,
    step_2_business_model: journeyData.step_2_business_model as { industry?: string; type?: string } | null,
  });
  
  const model = detectBusinessModel({
    step_2_business_model: journeyData.step_2_business_model as { type?: string; model?: string } | null,
  });
  
  const maturity = calculateMaturity(journeyData.current_step, journeyData.journey_complete);
  
  const palette = INDUSTRY_PALETTES[industry];
  const morphology = MODEL_MORPHOLOGY[model];
  
  // Maturity affects particle count and geometry detail
  const maturityFactor = maturity / 100;
  
  return {
    primaryColor: palette.primary,
    secondaryColors: [palette.secondary, palette.accent],
    accentColor: palette.accent,
    glowColor: palette.glow,
    morphIntensity: morphology.morphIntensity * (0.8 + maturityFactor * 0.4),
    morphSpeed: morphology.morphSpeed,
    geometryDetail: Math.min(6, morphology.geometryDetail + Math.floor(maturityFactor * 2)),
    particleEnabled: maturity >= 30,
    particleCount: Math.floor(30 + maturityFactor * 50),
    industry,
    model,
    maturity,
  };
}

/**
 * Blend two business orb profiles (for unified visualization)
 */
export function blendBusinessProfiles(
  profiles: BusinessOrbProfile[]
): BusinessOrbProfile {
  if (profiles.length === 0) {
    return generateBusinessOrbProfile({
      current_step: 1,
      journey_complete: false,
    });
  }
  
  if (profiles.length === 1) {
    return profiles[0];
  }
  
  // Blend colors from multiple businesses
  const blendedSecondaryColors = profiles.flatMap(p => p.secondaryColors).slice(0, 4);
  
  // Use the most mature business as primary
  const mostMature = profiles.reduce((a, b) => 
    a.maturity > b.maturity ? a : b
  );
  
  return {
    ...mostMature,
    secondaryColors: blendedSecondaryColors,
    particleCount: Math.min(100, profiles.reduce((sum, p) => sum + p.particleCount, 0)),
    maturity: Math.round(profiles.reduce((sum, p) => sum + p.maturity, 0) / profiles.length),
  };
}
