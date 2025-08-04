import { useState, useCallback } from 'react';
import { Connection, Keypair } from '@solana/web3.js';
import { useMutation } from '@tanstack/react-query';
import { usePrivyWallet } from './usePrivyWallet';
import { 
  createAndLaunchToken, 
  type CreateTokenMetadata, 
  type PumpFunTokenResult,
  type TokenCreationStatus 
} from '../services/pumpFunTokenService';

// Use Helius RPC URL from environment variables
const SOLANA_RPC_URL = import.meta.env.VITE_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com';

interface CreateTokenParams {
  metadata: CreateTokenMetadata;
  buyAmountSol?: number; // Optional initial buy amount
}

export const useCreateTokenPumpFun = () => {
  const [status, setStatus] = useState<TokenCreationStatus | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { ready, authenticated, solanaWallet } = usePrivyWallet();

  const statusCallback = useCallback((newStatus: TokenCreationStatus) => {
    setStatus(newStatus);
  }, []);

  const createTokenMutation = useMutation<
    PumpFunTokenResult,
    Error,
    CreateTokenParams
  >({
    mutationFn: async ({ metadata, buyAmountSol = 0.01 }) => {
      setIsCreating(true);
      setStatus({ message: 'Preparing token creation...', step: 0, logs: [] });

      try {
        if (!ready || !authenticated) {
          throw new Error('Wallet not connected');
        }

        if (!solanaWallet) {
          throw new Error('No Solana wallet found');
        }

        const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
        
        // For now, we'll use a placeholder keypair since Privy wallet integration
        // for transaction signing is complex. In production, you'd need to implement
        // proper Privy wallet transaction signing
        const creatorKeypair = Keypair.generate();
        
        const result = await createAndLaunchToken(
          connection,
          creatorKeypair,
          metadata,
          buyAmountSol,
          statusCallback
        );

        if (!result.success) {
          throw new Error(result.error || 'Token creation failed');
        }

        return result;
      } finally {
        setIsCreating(false);
      }
    },
    onSuccess: (result) => {
      console.log('Token created successfully:', result);
      setStatus({
        message: '🎉 Token created and launched on Pump.fun!',
        step: 4,
        logs: [
          `Mint Address: ${result.mintAddress}`,
          `Transaction: ${result.signature}`,
          `Metadata: ${result.metadataUri}`,
          `View on Pump.fun: https://pump.fun/${result.mintAddress}`
        ]
      });
    },
    onError: (error) => {
      console.error('Token creation error:', error);
      setStatus({
        message: `❌ Token creation failed: ${error.message}`,
        step: -1,
        logs: [error.message]
      });
    },
  });

  return {
    // Mutation state
    createToken: createTokenMutation.mutateAsync,
    isCreating: isCreating || createTokenMutation.isPending,
    error: createTokenMutation.error,
    
    // Creation status and progress
    status,
    isSuccess: createTokenMutation.isSuccess,
    data: createTokenMutation.data,
    
    // Reset function
    reset: () => {
      createTokenMutation.reset();
      setStatus(null);
      setIsCreating(false);
    }
  };
};

export default useCreateTokenPumpFun;