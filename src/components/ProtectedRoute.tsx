import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Redirect, Route, RouteProps, RouteComponentProps } from 'react-router-dom';

interface ProtectedRouteProps extends Omit<RouteProps, 'component'> {
  component: React.ComponentType<any>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  ...rest
}) => {
  // Check if Privy is configured
  const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID;
  const hasValidAppId = PRIVY_APP_ID && (PRIVY_APP_ID.startsWith('cl') || PRIVY_APP_ID.startsWith('cmb')) && PRIVY_APP_ID.length > 10;

  // If no valid Privy app ID, just render the component without authentication
  if (!hasValidAppId) {
    return (
      <Route
        {...rest}
        render={(props: RouteComponentProps) => <Component {...props} />}
      />
    );
  }

  const { ready, authenticated } = usePrivy();

  // For development, allow access without authentication if ready but not authenticated
  if (!ready) {
    return null; // loading state
  }

  return (
    <Route
      {...rest}
      render={(props: RouteComponentProps) => 
        authenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};
