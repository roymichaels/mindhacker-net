/**
 * @module domain/coaches/mappers
 * @purpose Identity mappers from practitioner DB rows to Coach domain types
 * 
 * Currently pass-through. Provides the seam for future domain divergence
 * without touching DB schema.
 */

import type {
  Practitioner,
  PractitionerService,
  PractitionerReview,
  PractitionerSpecialty,
  PractitionerWithDetails,
} from '@/hooks/usePractitioners';

import type {
  Coach,
  CoachService,
  CoachReview,
  CoachSpecialty,
  CoachWithDetails,
} from './types';

export const toCoach = (p: Practitioner): Coach => p;
export const toCoachService = (s: PractitionerService): CoachService => s;
export const toCoachReview = (r: PractitionerReview): CoachReview => r;
export const toCoachSpecialty = (s: PractitionerSpecialty): CoachSpecialty => s;
export const toCoachWithDetails = (p: PractitionerWithDetails): CoachWithDetails => p;

// Reverse mappers (identity for now)
export const fromCoach = (c: Coach): Practitioner => c;
export const fromCoachService = (s: CoachService): PractitionerService => s;
