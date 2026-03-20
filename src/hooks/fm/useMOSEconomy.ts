/**
 * useMOSEconomy — Central hook for the MOS virtual economy.
 * Handles spending, fee calculation, transaction preview, and data contribution toggle.
 * Designed to be blockchain-upgradable (Phase 2).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFMWallet } from '@/hooks/useFMWallet';
import { toast } from 'sonner';

// Constants — matches tokenomics config
export const MOS_TO_USD = 0.01;
export const FEE_RATE = 0.02; // 2%
export const FEE_SPLIT = {
  treasury: 0.50,
  rewards: 0.25,
  reserve: 0.25,
} as const;

export interface FeeBreakdown {
  grossAmount: number;
  feeAmount: number;
  netToSeller: number;
  feeUsd: number;
  grossUsd: number;
  netUsd: number;
  split: {
    treasury: number;
    rewards: number;
    reserve: number;
  };
}

export interface SpendParams {
  amount: number;
  description?: string;
  referenceType?: string;
  referenceId?: string;
  sellerId?: string;
  idempotencyKey?: string;
}

export interface SpendResult {
  success: boolean;
  transactionId?: string;
  grossAmount?: number;
  fee?: number;
  netToSeller?: number;
  newBalance?: number;
  error?: string;
}

/**
 * Calculate fee breakdown for any MOS amount.
 * Pure function — no DB calls.
 */
export function calculateFee(amount: number): FeeBreakdown {
  const feeAmount = Math.round(amount * FEE_RATE * 100) / 100;
  const netToSeller = amount - feeAmount;
  return {
    grossAmount: amount,
    feeAmount,
    netToSeller,
    feeUsd: feeAmount * MOS_TO_USD,
    grossUsd: amount * MOS_TO_USD,
    netUsd: netToSeller * MOS_TO_USD,
    split: {
      treasury: Math.round(feeAmount * FEE_SPLIT.treasury * 100) / 100,
      rewards: Math.round(feeAmount * FEE_SPLIT.rewards * 100) / 100,
      reserve: Math.round(feeAmount * (1 - FEE_SPLIT.treasury - FEE_SPLIT.rewards) * 100) / 100,
    },
  };
}

export function useMOSEconomy() {
  const { user } = useAuth();
  const { wallet } = useFMWallet();
  const queryClient = useQueryClient();

  const balance = wallet?.mos_balance ?? 0;
  const canAfford = (amount: number) => balance >= amount;

  const spendMutation = useMutation({
    mutationFn: async (params: SpendParams): Promise<SpendResult> => {
      if (!user?.id) return { success: false, error: 'Not authenticated' };

      const { data, error } = await supabase.rpc('fm_spend_mos', {
        p_user_id: user.id,
        p_amount: params.amount,
        p_description: params.description ?? null,
        p_reference_type: params.referenceType ?? null,
        p_reference_id: params.referenceId ?? null,
        p_seller_id: params.sellerId ?? null,
        p_idempotency_key: params.idempotencyKey ?? null,
      });

      if (error) return { success: false, error: error.message };

      const result = data as any;
      if (!result?.success) return { success: false, error: result?.error ?? 'Transaction failed' };

      return {
        success: true,
        transactionId: result.transaction_id,
        grossAmount: result.gross_amount,
        fee: result.fee,
        netToSeller: result.net_to_seller,
        newBalance: result.new_balance,
      };
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['fm-wallet'] });
        queryClient.invalidateQueries({ queryKey: ['fm-transactions'] });
      }
    },
  });

  const toggleDataContribution = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('fm_wallets')
        .update({ data_contribution_enabled: enabled })
        .eq('user_id', user.id);
      if (error) throw error;
      return enabled;
    },
    onSuccess: (enabled) => {
      queryClient.invalidateQueries({ queryKey: ['fm-wallet'] });
      toast.success(enabled ? '📊 Data contribution enabled' : 'Data contribution disabled');
    },
  });

  return {
    // State
    balance,
    wallet,
    canAfford,
    isDataContributionEnabled: !!(wallet as any)?.data_contribution_enabled,

    // Actions
    spendMOS: spendMutation.mutateAsync,
    isSpending: spendMutation.isPending,
    toggleDataContribution: toggleDataContribution.mutateAsync,
    isTogglingData: toggleDataContribution.isPending,

    // Pure helpers
    calculateFee,
    previewTransaction: (amount: number) => ({
      ...calculateFee(amount),
      currentBalance: balance,
      balanceAfter: balance - amount,
      canAfford: balance >= amount,
    }),
  };
}
