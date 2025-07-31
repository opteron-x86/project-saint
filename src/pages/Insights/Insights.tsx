import React, { useState } from 'react';
import {
  Box, Typography, Paper, useTheme, Tabs, Tab,
  FormControl, InputLabel, Select, MenuItem, SelectChangeEvent,
  useMediaQuery, alpha
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { Card, LoadingIndicator, ErrorDisplay } from '@/components/common';
import { useRuleStatsQuery, useTechniqueCoverageQuery } from '@/api/queries';
import { SEVERITY_COLORS, PLATFORM_COLORS } from '@/utils/constants';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ height: '100%' }}>
    {value === index && <Box sx={{ pt: 2, height: '100%' }}>{children}</Box>}
  </div>
);

const Insights: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('30d');
  
  const { data: statsData, isLoading: isLoadingStats } = useRuleStatsQuery();
  const { data: coverageData, isLoading: isLoadingCoverage } = useTechniqueCoverageQuery();

  // Mock time series data - in production, create an endpoint for historical data
  const timeSeriesData = [
    { date: '2024-12', rules: 245, coverage: 62 },
    { date: '2025-01', rules: 268, coverage: 65 },
    { date: '2025-02', rules: 285, coverage: 68 },
    { date: '2025-03', rules: 312, coverage: 72 },
    { date: '2025-04', rules: 334, coverage: 75 },
    { date: '2025-05', rules: 356, coverage: 78 },
    { date: '2025-06', rules: 378, coverage: 82 },
  ];

  // Transform data for visualizations
  const severityData = Object.entries(statsData?.stats?.by_severity || {}).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    color: SEVERITY_COLORS[key] || '#8884d8'
  }));

  const platformData = Object.entries(statsData?.stats?.by_platform || {}).map(([key, value]) => ({
    name: key,
    value,
    color: PLATFORM_COLORS[key] || PLATFORM_COLORS.DEFAULT
  }));

  // Coverage gaps analysis
  const coverageGaps = coverageData?.techniques
    ?.filter(t => t.count === 0)
    .slice(0, 20) || [];

  // Rule source distribution for treemap
  const ruleSourceData = Object.entries(statsData?.stats?.by_rule_source || {}).map(([name, value]) => ({
    name,
    value,
    fill: theme.palette.primary.main
  }));

  // Mock detection efficacy data
  const detectionEfficacyData = [
    { technique: 'Persistence', coverage: 85, falsePositives: 12 },
    { technique: 'Privilege Escalation', coverage: 72, falsePositives: 8 },
    { technique: 'Defense Evasion', coverage: 68, falsePositives: 15 },
    { technique: 'Credential Access', coverage: 90, falsePositives: 5 },
    { technique: 'Discovery', coverage: 45, falsePositives: 20 },
    { technique: 'Lateral Movement', coverage: 78, falsePositives: 10 },
  ];

  if (isLoadingStats || isLoadingCoverage) {
    return <LoadingIndicator message="Loading insights data..." />;
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: isMobile ? 2 : 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight="bold">Security & Platform Insights</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} label="Time Range">
            <MenuItem value="7d">Last 7 days</MenuItem>
            <MenuItem value="30d">Last 30 days</MenuItem>
            <MenuItem value="90d">Last 90 days</MenuItem>
            <MenuItem value="1y">Last year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Tabs */}
      <Paper sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="scrollable">
          <Tab icon={<TrendingUpIcon />} iconPosition="start" label="Trends" />
          <Tab icon={<SecurityIcon />} iconPosition="start" label="Coverage Analysis" />
          <Tab icon={<AssessmentIcon />} iconPosition="start" label="Rule Analytics" />
          <Tab icon={<TimelineIcon />} iconPosition="start" label="Detection Efficacy" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Rules Growth Over Time */}
            <Grid size={12}>
              <Card title="Detection Rules Growth & Coverage Trend" sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper }} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="rules" stroke={theme.palette.primary.main} name="Total Rules" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="coverage" stroke={theme.palette.success.main} name="Coverage %" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Key Metrics Summary */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: 200, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <Typography variant="h6" gutterBottom>Average Monthly Growth</Typography>
                <Typography variant="h2" color="primary">+22</Typography>
                <Typography variant="body2" color="text.secondary">New rules per month</Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: 200, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                <Typography variant="h6" gutterBottom>Coverage Improvement</Typography>
                <Typography variant="h2" color="success.main">+20%</Typography>
                <Typography variant="body2" color="text.secondary">Over last 6 months</Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: 200, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                <Typography variant="h6" gutterBottom>Rules Needing Review</Typography>
                <Typography variant="h2" color="warning.main">47</Typography>
                <Typography variant="body2" color="text.secondary">Not validated</Typography>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {/* Platform Coverage Distribution */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card title="Coverage by Platform" sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill={theme.palette.primary.main}>
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Top Coverage Gaps */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card title="Top Coverage Gaps" sx={{ height: 400, overflow: 'auto' }}>
                {coverageGaps.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography color="success.main">Excellent! No techniques with zero coverage.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ p: 1 }}>
                    {coverageGaps.map((gap, idx) => (
                      <Paper key={gap.technique_id} variant="outlined" sx={{ p: 1.5, mb: 1, borderLeft: `3px solid ${theme.palette.error.main}` }}>
                        <Typography variant="body2" fontWeight={500}>{idx + 1}. {gap.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{gap.technique_id}</Typography>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Card>
            </Grid>

            {/* Rule Source Distribution Treemap */}
            <Grid size={12}>
              <Card title="Rule Distribution by Source" sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap data={ruleSourceData} dataKey="value" stroke="#fff" fill={theme.palette.primary.main}>
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        return (
                          <Paper sx={{ p: 1 }}>
                            <Typography variant="body2">{payload[0].payload.name}</Typography>
                            <Typography variant="caption" color="primary">{payload[0].value} rules</Typography>
                          </Paper>
                        );
                      }
                      return null;
                    }} />
                  </Treemap>
                </ResponsiveContainer>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {/* Severity Distribution */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card title="Rule Severity Distribution" sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={severityData} cx="50%" cy="50%" outerRadius={120} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Rules by Platform (Rule-specific) */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card title="Rules by Platform Type" sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={Object.entries(statsData?.stats?.by_rule_platform || {}).slice(0, 8).map(([k, v]) => ({ platform: k, rules: v }))}>
                    <PolarGrid stroke={alpha(theme.palette.divider, 0.5)} />
                    <PolarAngleAxis dataKey="platform" />
                    <PolarRadiusAxis angle={90} domain={[0, 'auto']} />
                    <Radar name="Rules" dataKey="rules" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Rule Quality Metrics */}
            <Grid size={12}>
              <Card title="Rule Quality Indicators">
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                      <Typography variant="h4" color="success.main">87%</Typography>
                      <Typography variant="body2">Rules Validated</Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                      <Typography variant="h4" color="info.main">2.3</Typography>
                      <Typography variant="body2">Avg Techniques/Rule</Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                      <Typography variant="h4" color="warning.main">156</Typography>
                      <Typography variant="body2">Rules Updated This Month</Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                      <Typography variant="h4" color="error.main">23</Typography>
                      <Typography variant="body2">Stale Rules (6 months)</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {/* Detection Efficacy by Tactic */}
            <Grid size={12}>
              <Card title="Detection Coverage vs False Positive Rate by Tactic" sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={detectionEfficacyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="technique" angle={-30} textAnchor="end" height={100} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="coverage" fill={theme.palette.success.main} name="Coverage %" />
                    <Bar yAxisId="right" dataKey="falsePositives" fill={theme.palette.error.main} name="False Positives" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Recommendations */}
            <Grid size={12}>
              <Card title="AI-Powered Recommendations">
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper variant="outlined" sx={{ p: 2, borderLeft: `4px solid ${theme.palette.info.main}` }}>
                      <Typography variant="subtitle2" gutterBottom color="info.main">Coverage Opportunity</Typography>
                      <Typography variant="body2">Consider adding rules for T1055 (Process Injection) - high-impact technique with only 45% coverage.</Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper variant="outlined" sx={{ p: 2, borderLeft: `4px solid ${theme.palette.warning.main}` }}>
                      <Typography variant="subtitle2" gutterBottom color="warning.main">Optimization Suggestion</Typography>
                      <Typography variant="body2">Rules targeting Discovery tactics show high false positive rates. Consider tuning thresholds.</Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper variant="outlined" sx={{ p: 2, borderLeft: `4px solid ${theme.palette.success.main}` }}>
                      <Typography variant="subtitle2" gutterBottom color="success.main">Performance Insight</Typography>
                      <Typography variant="body2">Credential Access rules show excellent efficacy with 90% coverage and low false positives.</Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper variant="outlined" sx={{ p: 2, borderLeft: `4px solid ${theme.palette.error.main}` }}>
                      <Typography variant="subtitle2" gutterBottom color="error.main">Action Required</Typography>
                      <Typography variant="body2">23 rules haven't been updated in 6+ months. Schedule review to ensure continued relevance.</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default Insights;