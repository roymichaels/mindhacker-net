/**
 * @module domain/coaches
 * @purpose Central barrel export for Coach domain layer.
 * ALL coach data access in the app flows through this module.
 * No UI component should call .from('practitioner_*') directly.
 */

export * from './types';
export * from './hooks';
export * from './mappers';
