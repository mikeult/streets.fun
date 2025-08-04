import { usePrivy, useSolanaWallets, useCreateWallet } from '@privy-io/react-auth';
import { Connection, Transaction } from '@solana/web3.js';
import { useMutation } from '@tanstack/react-query';

// Use Helius RPC URL from environment variables
const SOLANA_RPC_URL =
  import.meta.env.VITE_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com';

export interface PrivySignTransactionParams {
  encodedTransaction: string;
}

export interface PrivySignTransactionResult {
  encodedTransaction: string;
}

export const usePrivyWallet = () => {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useSolanaWallets();
  const { createWallet } = useCreateWallet();



  // Get the first Solana wallet (embedded or connected)
  const solanaWallet = wallets.length > 0 ? wallets[0] : null;

  const signTransactionMutation = useMutation<
    PrivySignTransactionResult,
    Error,
    PrivySignTransactionParams
  >({
    mutationFn: async (params: PrivySignTransactionParams) => {
      if (!ready || !authenticated) {
        throw new Error('User not authenticated');
      }

      if (!solanaWallet) {
        throw new Error('No Solana wallet found');
      }

      if (!solanaWallet.sendTransaction) {
        throw new Error('Wallet does not support transaction signing');
      }

      try {
        console.log('Decoding transaction for Privy signing...');

        // Decode the base64 transaction (we're sending base64, not base58)
        const transactionBuffer = Buffer.from(params.encodedTransaction, 'base64');
        
        // Use VersionedTransaction since that's what we're creating in the service
        const { VersionedTransaction } = await import('@solana/web3.js');
        const transaction = VersionedTransaction.deserialize(transactionBuffer);

        console.log('Transaction decoded, signing with Privy wallet...');

        // Create connection for signing (but not sending)
        const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

        // Sign transaction using Privy wallet (don't send it yet)
        const signedTransaction = await solanaWallet.signTransaction(transaction);

        console.log('Transaction signed successfully with Privy');

        // Serialize the signed transaction back to base64
        const signedTransactionBuffer = Buffer.from(signedTransaction.serialize());
        const signedEncodedTransaction = signedTransactionBuffer.toString('base64');

        return {
          encodedTransaction: signedEncodedTransaction,
        };
      } catch (error) {
        console.error('Error signing transaction with Privy:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Transaction signed successfully with Privy:', data.encodedTransaction.slice(0, 50) + '...');
    },
    onError: (error) => {
      console.error('Privy transaction signing error:', error);
    },
  });

  return {
    // Wallet info
    ready,
    authenticated,
    user,
    solanaWallet,
    walletAddress: solanaWallet?.address,
    hasWallet: wallets.length > 0,

    // Wallet management
    createWallet: () => createWallet({ walletType: 'solana' }),

    // Transaction signing
    signTransaction: signTransactionMutation.mutateAsync,
    isSigningTransaction: signTransactionMutation.isPending,
    signTransactionError: signTransactionMutation.error,
  };
};
