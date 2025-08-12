// src/components/common/UnderConstruction.tsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  useTheme,
  alpha,
} from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';

interface UnderConstructionProps {
  pageName?: string;
  description?: string;
  showBackButton?: boolean;
}

const UnderConstruction: React.FC<UnderConstructionProps> = ({
  pageName = 'This Page',
  description = 'This feature is currently under development and will be available soon.',
  showBackButton = true,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <ConstructionIcon
            sx={{
              fontSize: 80,
              color: theme.palette.primary.main,
              opacity: 0.7,
            }}
          />
          
          <Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}
            >
              {pageName} Under Construction
            </Typography>
            
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 400, mx: 'auto' }}
            >
              {description}
            </Typography>
          </Box>

          {showBackButton && (
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                mt: 2,
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default UnderConstruction;