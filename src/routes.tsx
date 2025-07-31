import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Box, CircularProgress } from '@mui/material';
import AppLayout from '@/components/layout/AppLayout';

// Lazy loaded pages
const Dashboard = lazy(() => import('@/pages/Dashboard/Dashboard'));
const RulesExplorer = lazy(() => import('@/pages/RulesExplorer/RulesExplorer'));
const AttackMatrix = lazy(() => import('@/pages/AttackMatrix/AttackMatrix'));
const Insights = lazy(() => import('@/pages/Insights/Insights'));

// Loading fallback
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      width: '100%',
    }}
  >
    <CircularProgress />
  </Box>
);

interface AppRoutesProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const AppRoutes = ({ toggleTheme, isDarkMode }: AppRoutesProps) => {
  return (
    <AppLayout toggleTheme={toggleTheme} isDarkMode={isDarkMode}>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rules" element={<RulesExplorer />} />
          <Route path="/attack-matrix" element={<AttackMatrix />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};

export default AppRoutes;