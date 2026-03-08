/**
 * useNowEngine — Layer 5: Live Execution Engine.
 * 
 * PURPOSE: Guides the user step-by-step through the CURRENT action.
 * Does NOT decide what the user does — that's the Daily Queue's job.
 * 
 * Responsibilities:
 * - Focus mode management (which action is active)
 * - Step-by-step execution tracking
 * - Action completion / skip
 * - Progress tracking within a single action
 * 
 * Pipeline position:
 * Identity → Strategy → Phase → Weekly Plan → Daily Queue → **NOW EXECUTION**
 */
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleActionStatus } from '@/services/actionItems';
import type { NowQueueItem, ExecutionStep, ExecutionTemplate } from '@/types/planning';

// Re-export types for backward compatibility
export type { NowQueueItem, ExecutionStep, ExecutionTemplate };

// ── Execution State ──
export interface NowExecutionState {
  /** The action currently being executed */
  activeAction: NowQueueItem | null;
  /** Current step index within the action */
  currentStepIndex: number;
  /** Whether focus/execution mode is active */
  isFocusMode: boolean;
  /** Timer state for timed steps */
  elapsedSec: number;
  /** Whether the execution is paused */
  isPaused: boolean;
}

/**
 * useNowEngine — Live execution layer.
 * Call this to manage real-time step-by-step execution of a single action.
 */
export function useNowEngine() {
  const [state, setState] = useState<NowExecutionState>({
    activeAction: null,
    currentStepIndex: 0,
    isFocusMode: false,
    elapsedSec: 0,
    isPaused: false,
  });

  /** Enter focus mode for a specific action */
  const startExecution = useCallback((action: NowQueueItem) => {
    setState({
      activeAction: action,
      currentStepIndex: 0,
      isFocusMode: true,
      elapsedSec: 0,
      isPaused: false,
    });
  }, []);

  /** Advance to the next step within the current action */
  const nextStep = useCallback(() => {
    setState(prev => {
      const steps = prev.activeAction?.executionSteps || [];
      if (prev.currentStepIndex < steps.length - 1) {
        return { ...prev, currentStepIndex: prev.currentStepIndex + 1, elapsedSec: 0 };
      }
      return prev;
    });
  }, []);

  /** Go back to previous step */
  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStepIndex: Math.max(0, prev.currentStepIndex - 1),
      elapsedSec: 0,
    }));
  }, []);

  /** Toggle pause state */
  const togglePause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  /** Exit focus mode */
  const exitExecution = useCallback(() => {
    setState({
      activeAction: null,
      currentStepIndex: 0,
      isFocusMode: false,
      elapsedSec: 0,
      isPaused: false,
    });
  }, []);

  /** Update elapsed time (called by timer interval) */
  const tick = useCallback(() => {
    setState(prev => {
      if (prev.isPaused || !prev.isFocusMode) return prev;
      return { ...prev, elapsedSec: prev.elapsedSec + 1 };
    });
  }, []);

  // Derived state
  const currentStep = state.activeAction?.executionSteps?.[state.currentStepIndex] || null;
  const totalSteps = state.activeAction?.executionSteps?.length || 0;
  const isLastStep = state.currentStepIndex >= totalSteps - 1;
  const progressPercent = totalSteps > 0
    ? Math.round(((state.currentStepIndex + 1) / totalSteps) * 100)
    : 0;

  return {
    // State
    ...state,
    currentStep,
    totalSteps,
    isLastStep,
    progressPercent,

    // Actions
    startExecution,
    nextStep,
    prevStep,
    togglePause,
    exitExecution,
    tick,
  };
}

/**
 * useCompleteNowAction — Marks an action as done/undone.
 * Shared between Daily Queue and Now Execution layers.
 */
export function useCompleteNowAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ actionId, done }: { actionId: string; done: boolean }) => {
      return toggleActionStatus(actionId, done);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-queue'] });
      queryClient.invalidateQueries({ queryKey: ['completed-today'] });
      queryClient.invalidateQueries({ queryKey: ['action-items'] });
      queryClient.invalidateQueries({ queryKey: ['tactical-schedule'] });
    },
  });
}
