// src/pages/Dashboard/Dashboard.tsx

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  useTheme,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  ListItemButton,
  SelectChangeEvent,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SecurityIcon from '@mui/icons-material/Security';
import BugReportIcon from '@mui/icons-material/BugReport';
import HubIcon from '@mui/icons-material/Hub';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { useDashboardQuery, useTrendAnalysisQuery } from '@/api/queries';
import { Card, ErrorDisplay } from '@/components/common';
import { SEVERITY_COLORS } from '@/utils/constants';
import { useFilterStore } from '@/store';
import type { DashboardFilters, DashboardAlert } from '@/api/types';

const TIME_RANGES = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
  { label: '1 Year', value: 365 },
] as const;

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon?: React.ReactNode;
  color?: string;
  onClick?: () => void;
  alert?: DashboardAlert;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  change,
  icon,
  color,
  onClick,
  alert,
}) => {
  const theme = useTheme();
  
  return (
    <Paper
      sx={{
        p: 2.5,
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        borderTop: `3px solid ${color || theme.palette.primary.main}`,
        position: 'relative',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        } : {},
      }}
      onClick={onClick}
    >
      <Stack spacing={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {icon && (
            <Box sx={{ color: color || theme.palette.primary.main }}>
              {icon}
            </Box>
          )}
        </Box>
        
        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>
        
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        
        {change !== undefined && (
          <Box display="flex" alignItems="center" gap={0.5}>
            {change > 0 ? (
              <TrendingUpIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />
            ) : change < 0 ? (
              <TrendingDownIcon sx={{ fontSize: 16, color: theme.palette.error.main }} />
            ) : null}
            <Typography
              variant="caption"
              sx={{
                color: change > 0 
                  ? theme.palette.success.main 
                  : change < 0 
                  ? theme.palette.error.main 
                  : theme.palette.text.secondary,
              }}
            >
              {change > 0 ? '+' : ''}{change}% from last period
            </Typography>
          </Box>
        )}
        
        {alert && (
          <Box 
            sx={{ 
              mt: 1.5, 
              pt: 1.5, 
              borderTop: 1, 
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <WarningAmberIcon 
              sx={{ 
                fontSize: 16, 
                color: theme.palette.warning.main 
              }} 
            />
            <Typography variant="caption" color="warning.main">
              {alert.message}
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { setSeverities, clearFilters } = useFilterStore();
  
  const [filters, setFilters] = useState<DashboardFilters>({
    days_back: 30,
  });
  
  const {
    data: dashboardData,
    isLoading,
    isError,
    refetch,
  } = useDashboardQuery(filters);
  
  const {
    data: trendData,
  } = useTrendAnalysisQuery(filters.days_back);
  
  const coverageImprovement = useMemo(() => {
    if (!trendData?.summary) return 0;
    const { total_created } = trendData.summary;
    const totalRules = dashboardData?.overview.total_rules || 1;
    return Math.round((total_created / totalRules) * 100 * 10) / 10;
  }, [dashboardData, trendData]);
  
  const handleTimeRangeChange = useCallback((event: SelectChangeEvent<number>) => {
    const newValue = Number(event.target.value);
    setFilters(prev => ({ ...prev, days_back: newValue }));
  }, []);
  
  const handleSeverityClick = useCallback((severity: string) => {
    clearFilters();
    setSeverities([severity]);
    navigate('/rules');
  }, [clearFilters, setSeverities, navigate]);
  
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);
  
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };
  
  const formatPercentage = (num: number): string => {
    return `${Math.round(num * 10) / 10}%`;
  };
  
  if (isError) {
    return (
      <Box p={3}>
        <ErrorDisplay message="Failed to load dashboard data" />
      </Box>
    );
  }
  
  const overview = dashboardData?.overview;
  const charts = dashboardData?.charts;
  const recentActivity = dashboardData?.recent_activity;
  
  // Find MITRE-related alert
  const mitreAlert = dashboardData?.alerts?.find(
    alert => alert.message.toLowerCase().includes('mitre')
  );
  
  // Filter out MITRE alert from main alerts list
  const otherAlerts = dashboardData?.alerts?.filter(
    alert => !alert.message.toLowerCase().includes('mitre')
  ) || [];
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Security Posture Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last updated: {dashboardData?.metadata.generated_at 
                ? new Date(dashboardData.metadata.generated_at).toLocaleString()
                : 'Loading...'}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="time-range-label">Time Range</InputLabel>
              <Select
                labelId="time-range-label"
                value={filters.days_back || 30}
                label="Time Range"
                onChange={handleTimeRangeChange}
              >
                {TIME_RANGES.map(range => (
                  <MenuItem key={range.value} value={range.value}>
                    {range.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Tooltip title="Refresh Dashboard">
              <IconButton onClick={handleRefresh} disabled={isLoading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>
      
      {isLoading && <LinearProgress sx={{ mb: 2 }} />}
      
      {/* Non-MITRE Alerts */}
      {otherAlerts.length > 0 && (
        <Stack spacing={1} mb={3}>
          {otherAlerts.map((alert, index) => (
            <Alert 
              key={index} 
              severity={alert.type}
              action={alert.count ? (
                <Chip label={`${alert.count} affected`} size="small" />
              ) : undefined}
            >
              {alert.message}
            </Alert>
          ))}
        </Stack>
      )}
      
      {/* Metrics Cards */}
      <Box mb={4}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Total Detection Rules"
              value={formatNumber(overview?.total_rules || 0)}
              subtitle={`${formatNumber(overview?.active_rules || 0)} active`}
              change={coverageImprovement}
              icon={<SecurityIcon />}
              color={theme.palette.primary.main}
              onClick={() => navigate('/rules')}
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="MITRE ATT&CK Coverage"
              value={formatPercentage(overview?.mitre_coverage.coverage_percentage || 0)}
              subtitle={`${overview?.mitre_coverage.techniques_covered || 0}/${overview?.mitre_coverage.total_techniques || 0} techniques`}
              icon={<HubIcon />}
              color={theme.palette.info.main}
              onClick={() => navigate('/attack-matrix')}
              alert={mitreAlert}
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="CVE Coverage"
              value={formatPercentage(overview?.cve_coverage.coverage_percentage || 0)}
              subtitle={`${formatNumber(overview?.cve_coverage.rules_with_cves || 0)} rules with CVEs`}
              icon={<BugReportIcon />}
              color={theme.palette.warning.main}
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Recent Activity"
              value={trendData?.summary.total_created || 0}
              subtitle={`New rules in ${filters.days_back} days`}
              icon={<NewReleasesIcon />}
              color={theme.palette.success.main}
            />
          </Grid>
        </Grid>
      </Box>
      
      {/* Charts Row 1 */}
      <Box mb={4}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: 400, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Rules by Severity
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={charts?.severity_distribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {charts?.severity_distribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={SEVERITY_COLORS[entry.name] || theme.palette.grey[400]}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSeverityClick(entry.name)}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ height: 400, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Top Rule Sources
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={charts?.rules_by_source || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      {/* Trend Chart */}
      {trendData && (
        <Box mb={4}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Activity Trend ({filters.days_back} days)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={trendData.daily_stats}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area
                      type="monotone"
                      dataKey="rules_created"
                      stackId="1"
                      stroke={theme.palette.success.main}
                      fill={theme.palette.success.light}
                      name="Rules Created"
                    />
                    <Area
                      type="monotone"
                      dataKey="rules_updated"
                      stackId="1"
                      stroke={theme.palette.info.main}
                      fill={theme.palette.info.light}
                      name="Rules Updated"
                    />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* Bottom Row */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: 400, overflow: 'auto' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">
                Recently Added Rules
              </Typography>
            </Box>
            <List>
              {recentActivity?.recent_rules.map((rule, index) => (
                <React.Fragment key={rule.rule_id}>
                  <ListItemButton
                    onClick={() => navigate(`/rules/${rule.rule_id}`)}
                  >
                    <ListItemIcon>
                      <Chip
                        label={rule.severity}
                        size="small"
                        sx={{
                          backgroundColor: SEVERITY_COLORS[rule.severity] || theme.palette.grey[400],
                          color: 'white',
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={rule.name}
                      secondary={`Created: ${new Date(rule.created_date).toLocaleDateString()}`}
                      primaryTypographyProps={{
                        variant: 'body2',
                        noWrap: true,
                      }}
                    />
                  </ListItemButton>
                  {index < recentActivity.recent_rules.length - 1 && <Divider />}
                </React.Fragment>
              )) || (
                <ListItem>
                  <ListItemText primary="No recent rules" />
                </ListItem>
              )}
            </List>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: 400, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              MITRE Tactic Coverage
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <RadarChart data={charts?.mitre_tactic_coverage || []}>
                <PolarGrid />
                <PolarAngleAxis dataKey="tactic" />
                <PolarRadiusAxis />
                <Radar
                  name="Rule Count"
                  dataKey="rules"
                  stroke={theme.palette.primary.main}
                  fill={theme.palette.primary.main}
                  fillOpacity={0.6}
                />
                <RechartsTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;