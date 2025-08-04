import { useState, useCallback } from 'react';
import { Connection } from '@solana/web3.js';
import { useMutation } from '@tanstack/react-query';
import { usePrivyWallet } from './usePrivyWallet';
import { 
  createAndLaunchTokenWithPrivy, 
  type CreateTokenMetadata, 
  type PumpFunTokenResult,
  type TokenCreationStatus,
  type PrivyWalletSigner
} from '../services/pumpFunTokenServiceWithPrivy';

// Use Helius RPC URL from environment variables
const SOLANA_RPC_URL = import.meta.env.VITE_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com';

interface CreateTokenParams {
  metadata: CreateTokenMetadata;
}

export const useCreateTokenPumpFunWithPrivy = () => {
  const [status, setStatus] = useState<TokenCreationStatus | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { ready, authenticated, solanaWallet, signTransaction } = usePrivyWallet();

  const statusCallback = useCallback((newStatus: TokenCreationStatus) => {
    setStatus(newStatus);
  }, []);

  const createTokenMutation = useMutation<
    PumpFunTokenResult,
    Error,
    CreateTokenParams
  >({
    mutationFn: async ({ metadata }) => {
      setIsCreating(true);
      setStatus({ message: 'Preparing token creation with Privy (mint only)...', step: 0, logs: [] });

      try {
        if (!ready || !authenticated) {
          throw new Error('Wallet not connected');
        }

        if (!solanaWallet) {
          throw new Error('No Solana wallet found');
        }

        if (!solanaWallet.address) {
          throw new Error('Wallet address not available');
        }

        // Create a Privy wallet signer interface
        const privyWalletSigner: PrivyWalletSigner = {
          address: solanaWallet.address,
          signTransaction: async (params: { encodedTransaction: string }) => {
            try {
              const result = await signTransaction(params);
              return result;
            } catch (error) {
              console.error('Privy transaction signing failed:', error);
              throw new Error(`Failed to sign transaction with Privy: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        };

        const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
        
        const result = await createAndLaunchTokenWithPrivy(
          connection,
          privyWalletSigner,
          metadata,
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
      console.log('Token created successfully with Privy:', result);
      setStatus({
        message: '🎉 Token created successfully with Privy!',
        step: 4,
        logs: [
          `Mint Address: ${result.mintAddress}`,
          `Transaction: ${result.signature}`,
          `Metadata: ${result.metadataUri}`,
          `View on Pump.fun: https://pump.fun/${result.mintAddress}`,
          `Signed with Privy wallet integration`,
          `Note: Token minted without initial buy`
        ]
      });
    },
    onError: (error) => {
      console.error('Token creation error with Privy:', error);
      setStatus({
        message: `❌ Token creation failed: ${error.message}`,
        step: -1,
        logs: [error.message, 'Check Privy wallet connection and try again']
      });
    },
  });

  // Enhanced validation for Privy-specific requirements
  const validatePrivyWallet = () => {
    if (!ready) {
      return { isValid: false, message: 'Privy wallet not ready' };
    }
    
    if (!authenticated) {
      return { isValid: false, message: 'Please authenticate with Privy' };
    }
    
    if (!solanaWallet) {
      return { isValid: false, message: 'No Solana wallet found in Privy' };
    }
    
    if (!solanaWallet.address) {
      return { isValid: false, message: 'Wallet address not available' };
    }
    
    return { isValid: true, message: 'Privy wallet ready' };
  };

  return {
    // Mutation state
    createToken: createTokenMutation.mutateAsync,
    isCreating: isCreating || createTokenMutation.isPending,
    error: createTokenMutation.error,
    
    // Creation status and progress
    status,
    isSuccess: createTokenMutation.isSuccess,
    data: createTokenMutation.data,
    
    // Privy wallet validation
    walletValidation: validatePrivyWallet(),
    walletAddress: solanaWallet?.address,
    isWalletReady: ready && authenticated && !!solanaWallet,
    
    // Reset function
    reset: () => {
      createTokenMutation.reset();
      setStatus(null);
      setIsCreating(false);
    }
  };
};

export default useCreateTokenPumpFunWithPrivy;