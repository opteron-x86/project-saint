// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, CssBaseline } from '@mui/material';
import App from '@/App';
import theme from '@/theme';
import { AuthProvider } from 'react-oidc-context';

const appBaseUrl = "http://localhost:5173"; // CHANGE TO SAINT DOMAIN

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-gov-east-1.amazonaws.com/us-gov-east-1_0eyDT5wUf",
  client_id: "61n3kobl25jj33q074sj68got6",
  redirect_uri: "http://localhost:5173", // CHANGE TO SAINT DOMAIN
  post_logout_redirect_uri: `${appBaseUrl}/logged-out`,
  response_type: "code",
  scope: "email openid phone",
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
);