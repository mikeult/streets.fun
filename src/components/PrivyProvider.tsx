import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth';
import { PropsWithChildren, useState, useEffect } from 'react';

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID;



export const PrivyProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [hasValidAppId, setHasValidAppId] = useState(false);

  useEffect(() => {
    // Check if we have a valid Privy app ID (starts with 'cl' or 'cmb' and is long enough)
    if (PRIVY_APP_ID && (PRIVY_APP_ID.startsWith('cl') || PRIVY_APP_ID.startsWith('cmb')) && PRIVY_APP_ID.length > 10) {
      setHasValidAppId(true);
    } else {
      console.warn('No valid Privy App ID found. Running in development mode without wallet authentication.');
      setHasValidAppId(false);
    }
  }, []);

  // If no valid Privy app ID, render without authentication provider
  if (!hasValidAppId) {
    return <>{children}</>;
  }

  // Render with Privy authentication
  try {
    return (
      <BasePrivyProvider
        appId={PRIVY_APP_ID}
        config={{
          appearance: {
            theme: 'light',
            accentColor: '#4F46E5',
            showWalletLoginFirst: true,
          },
          embeddedWallets: {
            solana: {
              createOnLogin: 'users-without-wallets',
            },
            showWalletUIs: true,
          },
        }}
      >
        {children}
      </BasePrivyProvider>
    );
  } catch (error) {
    console.error('Error initializing Privy:', error);
    return <>{children}</>;
  }
};
