<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
// src/main.tsx
=======
>>>>>>> a380730 (Initial deployment)
=======
// src/main.tsx
>>>>>>> 7f559c7 (add congnito auth)
=======
>>>>>>> bdbe7c9 (authenticator work)
=======
// src/main.tsx
>>>>>>> 6acc8f7 (Feature/authenticator)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, CssBaseline } from '@mui/material';
import App from '@/App';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import theme from '@/theme';
<<<<<<< HEAD
import { AuthProvider } from 'react-oidc-context';

// Environment-based configuration
const appBaseUrl = import.meta.env.VITE_APP_BASE_URL || "http://localhost:5173";
const redirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI || appBaseUrl;
=======
import { AuthProvider } from "react-oidc-context";
<<<<<<< HEAD
>>>>>>> 5f9b1eb (authenticator work)
=======
import { User } from 'oidc-client-ts'; // Import User type

>>>>>>> e849b4c (authenticator work)

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-gov-east-1.amazonaws.com/us-gov-east-1_0eyDT5wUf",
  client_id: "61n3kobl25jj33q074sj68got6",
<<<<<<< HEAD
  redirect_uri: redirectUri,
  post_logout_redirect_uri: `${appBaseUrl}/logged-out`,
  response_type: "code",
  scope: "email openid phone",
};

<<<<<<< HEAD
// Debug logging for environment verification
if (import.meta.env.DEV) {
  console.log('Environment Configuration:', {
    mode: import.meta.env.MODE,
    appBaseUrl,
    redirectUri,
    apiTarget: import.meta.env.VITE_API_TARGET,
  });
}

=======
=======
// import theme from '@/theme'; // Theme is managed by App.tsx

import { AuthProvider } from 'react-oidc-context';
import { oidcConfig } from './authConfig'; // Import the OIDC config
>>>>>>> 7f559c7 (add congnito auth)
=======
import theme from '@/theme';
>>>>>>> bdbe7c9 (authenticator work)
=======
  redirect_uri: "https://d84l1y8p4kdic.cloudfront.net",
  response_type: "code",
  scope: "email openid phone",
};
>>>>>>> 5f9b1eb (authenticator work)

// Create a client for React Query
>>>>>>> a380730 (Initial deployment)
=======
import theme from '@/theme';
import { AuthProvider } from 'react-oidc-context';

// Environment-based configuration
const appBaseUrl = import.meta.env.VITE_APP_BASE_URL || "http://localhost:5173";
const redirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI || appBaseUrl;

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-gov-east-1.amazonaws.com/us-gov-east-1_0eyDT5wUf",
  client_id: "61n3kobl25jj33q074sj68got6",
  redirect_uri: redirectUri,
  post_logout_redirect_uri: `${appBaseUrl}/logged-out`,
  response_type: "code",
  scope: "email openid phone",
};

<<<<<<< HEAD
<<<<<<< HEAD
// Create a client for React Query
>>>>>>> 961e392 (rollback authentication)
=======
>>>>>>> 6acc8f7 (Feature/authenticator)
=======
// Debug logging for environment verification
if (import.meta.env.DEV) {
  console.log('Environment Configuration:', {
    mode: import.meta.env.MODE,
    appBaseUrl,
    redirectUri,
    apiTarget: import.meta.env.VITE_API_TARGET,
  });
}

>>>>>>> 37ba2d8 (Initial commit)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 37ba2d8 (Initial commit)
      retry: (failureCount, error: any) => {
        // Don't retry on 404s or auth errors
        if (error?.status === 404 || error?.status === 401) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false, // Don't retry mutations by default
<<<<<<< HEAD
=======
>>>>>>> a380730 (Initial deployment)
=======
>>>>>>> 37ba2d8 (Initial commit)
    },
  },
});
=======
const queryClient = new QueryClient({ /* ... */ });

// Define the onSigninCallback function
const onSigninCallback = (user: User | void): void => {
  // Remove OIDC state and code from URL
  window.history.replaceState({}, document.title, window.location.pathname);
  // You can then use react-router or window.location to navigate
  // to the original 'state' path if it exists, or to a default page.
  const intendedPath = user?.state?.path || '/dashboard';
  // Check if window.location.pathname is already the intendedPath to avoid loop
  if (window.location.pathname !== intendedPath) {
     window.location.href = intendedPath; // Or use react-router's navigate for SPA navigation
  }
};
>>>>>>> e849b4c (authenticator work)
=======
    },
  },
});
>>>>>>> 961e392 (rollback authentication)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 6acc8f7 (Feature/authenticator)
    <AuthProvider {...cognitoAuthConfig}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
<<<<<<< HEAD
<<<<<<< HEAD
        {/* Only show devtools in development */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </AuthProvider>
=======
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline provides a consistent base styling */}
        <CssBaseline />
        <App />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
>>>>>>> a380730 (Initial deployment)
=======
        <ReactQueryDevtools initialIsOpen={false} />
=======
        {/* Only show devtools in development */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
>>>>>>> 37ba2d8 (Initial commit)
      </QueryClientProvider>
    </AuthProvider>
>>>>>>> 6acc8f7 (Feature/authenticator)
  </React.StrictMode>
);