// src/components/common/Card.tsx

import React, { ReactNode } from 'react';
import {
  Box,
  Card as MuiCard,
  CardContent,
  CardHeader,
  Typography,
  Divider,
  useTheme,
  CardProps as MuiCardProps,
} from '@mui/material';

interface CardProps extends MuiCardProps {
  /**
   * Card title
   */
  title?: string;
  
  /**
   * Card subtitle
   */
  subtitle?: string;
  
  /**
   * Action component to display in the header
   */
  action?: ReactNode;
  
  /**
   * Whether to show a loading state
   */
  loading?: boolean;
  
  /**
   * Whether to show an error state
   */
  error?: boolean;
  
  /**
   * Error message to display
   */
  errorMessage?: string;
  
  /**
   * Children content
   */
  children: ReactNode;
  
  /**
   * Footer content
   */
  footer?: ReactNode;
  
  /**
   * Whether to make the card height 100%
   */
  fullHeight?: boolean;
}

/**
 * A reusable card component with consistent styling
 */
const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  loading = false,
  error = false,
  errorMessage = 'An error occurred',
  children,
  footer,
  fullHeight = false,
  sx,
  ...rest
}) => {
  const theme = useTheme();
  
  return (
    <MuiCard
      elevation={0}
      sx={{
        height: fullHeight ? '100%' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${theme.palette.divider}`,
        transition: theme.transitions.create(['box-shadow', 'transform']),
        '&:hover': {
          boxShadow: `0 4px 12px 0 ${
            theme.palette.mode === 'dark'
              ? 'rgba(0, 0, 0, 0.3)'
              : 'rgba(0, 0, 0, 0.1)'
          }`,
        },
        ...sx,
      }}
      {...rest}
    >
      {/* Card Header */}
      {(title || subtitle) && (
        <>
          <CardHeader
            title={
              title && (
                <Typography variant="h6" color="text.primary">
                  {title}
                </Typography>
              )
            }
            subheader={
              subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )
            }
            action={action}
          />
          <Divider />
        </>
      )}
      
      {/* Card Content */}
      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 3,
          '&:last-child': {
            pb: 3,
          },
        }}
      >
        {/* Loading or error states take precedence over children */}
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              minHeight: 100,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          </Box>
        ) : error ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              minHeight: 100,
              color: 'error.main',
            }}
          >
            <Typography variant="body2" color="error">
              {errorMessage}
            </Typography>
          </Box>
        ) : (
          children
        )}
      </CardContent>
      
      {/* Card Footer */}
      {footer && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>{footer}</Box>
        </>
      )}
    </MuiCard>
  );
};

export default Card;