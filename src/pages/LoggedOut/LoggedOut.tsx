// src/pages/LoggedOut.tsx

import { Box, Typography, Button, Paper } from '@mui/material';
import { useAuth } from 'react-oidc-context';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const LoggedOut = () => {
  const auth = useAuth();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          borderRadius: 2,
          maxWidth: 400,
          textAlign: 'center',
        }}
      >
        <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main' }} />
        <Typography variant="h5" component="h1" gutterBottom>
          Logged Out Successfully
        </Typography>
        <Typography color="text.secondary">
          You have been signed out of your account.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => auth.signinRedirect()}
          sx={{ mt: 2 }}
        >
          Sign In Again
        </Button>
      </Paper>
    </Box>
  );
};

export default LoggedOut;