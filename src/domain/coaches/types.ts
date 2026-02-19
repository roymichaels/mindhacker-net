/**
 * @module domain/coaches/types
 * @purpose Domain adapter layer: "Coach" vocabulary over "practitioner" DB tables
 * 
 * DB tables remain: practitioners, practitioner_services, practitioner_reviews, practitioner_specialties
 * Application code uses: Coach, CoachService, CoachReview, CoachSpecialty, CoachWithDetails
 */

import type {
  Practitioner,
  PractitionerService,
  PractitionerReview,
  PractitionerSpecialty,
  PractitionerWithDetails,
} from '@/hooks/usePractitioners';

// ─── Domain Types (aliases) ─────────────────────────────────────────────────

export type Coach = Practitioner;
export type CoachService = PractitionerService;
export type CoachReview = PractitionerReview;
export type CoachSpecialty = PractitionerSpecialty;
export type CoachWithDetails = PractitionerWithDetails;

// Re-export for convenience
export type {
  Practitioner,
  PractitionerService,
  PractitionerReview,
  PractitionerSpecialty,
  PractitionerWithDetails,
};
