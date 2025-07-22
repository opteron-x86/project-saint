// src/components/rules/RuleCardSkeleton.tsx

import React from 'react';
import { Card, Box, Skeleton, Grid } from '@mui/material';

const RuleCardSkeleton: React.FC = () => (
<<<<<<< HEAD
<<<<<<< HEAD
  <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
=======
  <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 330 }}>
>>>>>>> 23a6656 (Feature/issue creator)
=======
  <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
>>>>>>> bae12e2 (Feature/dashboard improvements)
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      <Box sx={{ flex: 1, pr: 1 }}>
        <Skeleton variant="text" width="80%" height={32} />
        <Skeleton variant="text" width="40%" />
      </Box>
      <Skeleton variant="circular" width={24} height={24} />
    </Box>
    <Skeleton variant="text" width="60%" sx={{ mb: 2 }} />
<<<<<<< HEAD
<<<<<<< HEAD
    <Skeleton variant="rectangular" width="100%" height={100} sx={{ mb: 2 }} />
    <Box sx={{ mt: 'auto' }}>
=======
    <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />
    <Box>
>>>>>>> 23a6656 (Feature/issue creator)
=======
    <Skeleton variant="rectangular" width="100%" height={100} sx={{ mb: 2 }} />
    <Box sx={{ mt: 'auto' }}>
>>>>>>> bae12e2 (Feature/dashboard improvements)
      <Skeleton variant="text" width="50%" />
      <Skeleton variant="text" width="70%" />
    </Box>
  </Card>
);

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <Grid container spacing={2.5}>
    {Array.from(new Array(count)).map((_, index) => (
<<<<<<< HEAD
<<<<<<< HEAD
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
=======
      <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
>>>>>>> 23a6656 (Feature/issue creator)
=======
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
>>>>>>> bae12e2 (Feature/dashboard improvements)
        <RuleCardSkeleton />
      </Grid>
    ))}
  </Grid>
);