// src/authConfig.ts
import { AuthProviderProps } from 'react-oidc-context';

// Replace with your actual Cognito User Pool details
const COGNITO_REGION = 'us-gov-east-1'; // From your existing file
const COGNITO_USER_POOL_ID = 'us-gov-east-1_0eyDT5wUf'; // From your existing file
const COGNITO_APP_CLIENT_ID = '61n3kobl25jj33q074sj68got6'; // From your existing file

const COGNITO_DOMAIN = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`; // Adjusted based on your file
// If you have a custom domain or a User Pool Domain prefix, adjust COGNITO_DOMAIN accordingly.
// e.g., https://your-domain-prefix.auth.your-region.amazoncognito.com

// Ensure these URIs match your Cognito App Client settings for your Nginx/TLS setup eventually
// For local development with Vite's default port:
const REDIRECT_URI = `http://localhost:5173`; // Vite default is often 5173 for dev
const POST_LOGOUT_REDIRECT_URI = `http://localhost:5173`;

export const oidcConfig: AuthProviderProps = {
  authority: `https://cognito-idp.us-gov-east-1.amazonaws.com/us-gov-east-1_0eyDT5wUf`,
  client_id: '61n3kobl25jj33q074sj68got6',
  redirect_uri: 'http://localhost:5173',
  response_type: 'code',
  scope: 'email openid phone',


  // For Cognito, sometimes providing the metadata explicitly can help if discovery is an issue,
  // especially with the /logout endpoint.
  metadata: {
    issuer: `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`,
    authorization_endpoint: `${COGNITO_DOMAIN}/oauth2/authorize`,
    token_endpoint: `${COGNITO_DOMAIN}/oauth2/token`,
    userinfo_endpoint: `${COGNITO_DOMAIN}/oauth2/userInfo`, // Make sure this is the correct userInfo endpoint for your setup
    jwks_uri: `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
    // Cognito's end_session_endpoint needs client_id and logout_uri
    end_session_endpoint: `${COGNITO_DOMAIN}/logout?client_id=${COGNITO_APP_CLIENT_ID}&logout_uri=${encodeURIComponent(POST_LOGOUT_REDIRECT_URI)}`,
  }
};

// Helper function to construct the sign-up URL for Cognito's Hosted UI
export const getCognitoSignUpUrl = (): string => {
  const params = new URLSearchParams({
    client_id: COGNITO_APP_CLIENT_ID,
    response_type: 'code',
    scope: oidcConfig.scope!, // Use scope from config
    redirect_uri: REDIRECT_URI,
  });
  return `${COGNITO_DOMAIN}/signup?${params.toString()}`;
};

// Helper function to construct the forgot password URL
export const getCognitoForgotPasswordUrl = (): string => {
    const params = new URLSearchParams({
        client_id: COGNITO_APP_CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
    });
    return `${COGNITO_DOMAIN}/forgotPassword?${params.toString()}`;
};

// Helper function to construct the login URL (if you want to explicitly redirect to Cognito Hosted UI for login)
export const getCognitoLoginUrl = (): string => {
    const params = new URLSearchParams({
        client_id: COGNITO_APP_CLIENT_ID,
        response_type: 'code',
        scope: oidcConfig.scope!, // Use scope from config
        redirect_uri: REDIRECT_URI,
    });
    return `${COGNITO_DOMAIN}/login?${params.toString()}`;
};

// Specific sign-out for Cognito
export const cognitoSignOut = () => {
    // The end_session_endpoint in metadata should handle this if auth.signoutRedirect() is used.
    // If calling manually, construct the URL:
    window.location.href = `${COGNITO_DOMAIN}/logout?client_id=${COGNITO_APP_CLIENT_ID}&logout_uri=${encodeURIComponent(POST_LOGOUT_REDIRECT_URI)}`;
};