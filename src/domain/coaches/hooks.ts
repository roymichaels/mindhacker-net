/**
 * @module domain/coaches/hooks
 * @purpose Coach-vocabulary wrappers around practitioner hooks
 * @data usePractitioners, usePractitioner, useMyPractitionerProfile
 * 
 * These wrappers let application code use "coach" naming while the
 * underlying hooks continue to query the `practitioners` DB table.
 */

export {
  usePractitioners as useCoaches,
  usePractitioner as useCoach,
  useMyPractitionerProfile as useMyCoachProfile,
} from '@/hooks/usePractitioners';

// Re-export types from domain layer
export type {
  Coach,
  CoachService,
  CoachReview,
  CoachSpecialty,
  CoachWithDetails,
} from './types';
