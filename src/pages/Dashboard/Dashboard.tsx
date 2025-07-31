// src/pages/Dashboard/Dashboard.tsx
import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  useTheme,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Link as MuiLink,
  LinearProgress,
  ListItemButton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Icons
import SecurityIcon from '@mui/icons-material/Security';
import HubIcon from '@mui/icons-material/Hub';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import UpdateIcon from '@mui/icons-material/Update';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import LanguageIcon from '@mui/icons-material/Language';

// Project Imports
import { useRuleStatsQuery, useTechniqueCoverageQuery } from '@/api/queries';
import usePaginatedRules from '@/hooks/data/usePaginatedRules';
import useMitreAttackData from '@/hooks/data/useMitreAttackData';
import { RuleSummary, RuleSeverity, TechniqueCoverageDetail } from '@/api/types';
import { ErrorDisplay, Card, StatusBadge } from '@/components/common';
import { SEVERITY_DISPLAY, SEVERITY_COLORS, PLATFORM_COLORS } from '@/utils/constants';
import { useFilterStore } from '@/store';

// --- HELPER FUNCTIONS ---

const formatRelativeTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// --- REUSABLE COMPONENTS FOR THE DASHBOARD ---

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  isLoading?: boolean;
  color?: string;
}
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, isLoading, color }) => {
  const theme = useTheme();
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', borderLeft: `4px solid ${color || theme.palette.primary.main}` }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexGrow: 1 }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          {isLoading ? <Skeleton variant="text" width={80} height={40} /> : <Typography variant="h4" component="div" fontWeight="bold">{value}</Typography>}
        </Box>
        {icon && <Box sx={{ color: color || theme.palette.primary.main, fontSize: '2.5rem', opacity: 0.8 }}>{icon}</Box>}
      </Box>
    </Card>
  );
};

interface SeverityDonutChartProps {
    data: Record<string, number> | undefined;
    isLoading: boolean;
}
const SeverityDonutChart: React.FC<SeverityDonutChartProps> = ({ data, isLoading }) => {
    const theme = useTheme();
    const chartData = useMemo(() => {
        if (!data) return [];
        const severityOrder: (keyof typeof SEVERITY_DISPLAY)[] = ['critical', 'high', 'medium', 'low', 'unknown'];
        return severityOrder
            .filter(key => data[key] > 0)
            .map(key => ({
                name: SEVERITY_DISPLAY[key as RuleSeverity] || key,
                value: data[key],
                color: SEVERITY_COLORS[key as RuleSeverity] || '#8884d8',
            }));
    }, [data]);
    const totalRules = useMemo(() => chartData.reduce((acc, entry) => acc + entry.value, 0), [chartData]);

    if (isLoading) return <Skeleton variant="circular" width="100%" height={250} sx={{ mx: 'auto' }}/>;

    return (
        <Box sx={{ height: 300, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <RechartsTooltip contentStyle={{ background: theme.palette.background.paper, borderColor: theme.palette.divider, borderRadius: theme.shape.borderRadius }}/>
                    <Legend iconType="circle" verticalAlign="bottom" height={36} />
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" dataKey="value" paddingAngle={5} cornerRadius={8}>
                        {chartData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.color} />)}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <Typography variant="h4" fontWeight="bold">{totalRules}</Typography>
                <Typography variant="caption" color="text.secondary">Total Rules</Typography>
            </Box>
        </Box>
    );
};

interface BreakdownCardProps {
  title: string;
  data: Record<string, number> | undefined;
  isLoading?: boolean;
  colorMap?: Record<string, string>;
  icon?: React.ReactNode;
  valueFormatter?: (key: string) => string;
  onItemClick?: (key: string) => void;
}
const BreakdownCard: React.FC<BreakdownCardProps> = ({ title, data, isLoading, colorMap = {}, icon, valueFormatter, onItemClick }) => {
  const theme = useTheme();
  const sortedData = data ? Object.entries(data).sort(([, a], [, b]) => b - a) : [];

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
       <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
        {icon && <Box sx={{ mr: 1.5, color: 'text.secondary' }}>{icon}</Box>}
        <Typography variant="h6" component="div">{title}</Typography>
      </Box>
      <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
        {isLoading && <List>{[...Array(5)].map((_, i) => <ListItem key={i}><Skeleton width="100%" height={40}/></ListItem>)}</List>}
        {!isLoading && (!sortedData || sortedData.length === 0) && <Typography variant="body2" color="text.secondary" align="center" sx={{mt:2}}>No data available.</Typography>}
        {!isLoading && sortedData && sortedData.length > 0 && (
          <Grid container spacing={1.5}>
            {sortedData.map(([key, value]) => (
              <Grid size={{ xs: 12 }} key={key}>
                <MuiLink
                  component={onItemClick ? 'button' : 'div'}
                  onClick={() => onItemClick?.(key)}
                  sx={{
                    width: '100%',
                    textAlign: 'initial',
                    textDecoration: 'none',
                    p: 1.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    bgcolor: 'transparent',
                    borderLeft: `3px solid ${colorMap[key] || theme.palette.primary.light}`,
                    cursor: onItemClick ? 'pointer' : 'default',
                    transition: theme.transitions.create(['box-shadow', 'transform'], {
                      duration: theme.transitions.duration.short,
                    }),
                    '&:hover': onItemClick ? {
                      boxShadow: theme.shadows[2],
                      transform: 'translateY(-2px)',
                    } : {},
                  }}
                >
                  <Typography variant="body2" fontWeight="500" color="text.primary">{valueFormatter ? valueFormatter(key) : key}</Typography>
                  <Typography variant="body2" fontWeight="bold" color="text.secondary">{value}</Typography>
                </MuiLink>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Card>
  );
};


const RecentActivityPanel: React.FC = () => {
    const { rules, isLoading, isError, error } = usePaginatedRules(1, 5);
    const navigate = useNavigate();
    const handleRuleClick = (rule: RuleSummary) => navigate('/rules', { state: { initialSearchTerm: `${rule.id}` } });

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}><UpdateIcon sx={{ mr: 1.5, color: 'text.secondary' }} /><Typography variant="h6">Recent Rule Activity</Typography></Box>
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {isLoading && <List>{[...Array(5)].map((_, i) => <ListItem key={i}><Skeleton width="100%" height={40}/></ListItem>)}</List>}
                {isError && <ErrorDisplay message="Could not load recent rules." details={error?.message} />}
                {!isLoading && !isError && rules.length > 0 && (
                     <List disablePadding>
                        {rules.map((rule, index) => (
                            <React.Fragment key={rule.id}>
                                <ListItem disablePadding>
                                    <ListItemButton onClick={() => handleRuleClick(rule)} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5 }}>
                                        <ListItemText
                                            primary={<Typography variant="body2" fontWeight={500} noWrap title={rule.title} color="text.primary">{rule.title}</Typography>}
                                            secondary={<Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}><StatusBadge label={SEVERITY_DISPLAY[rule.severity as RuleSeverity]} status={rule.severity} size="small" /><Typography variant="caption" color="text.secondary">{formatRelativeTime(rule.modified_date)}</Typography></Box>}
                                            slotProps={{
                                                secondary: {
                                                    component: 'div',
                                                },
                                            }}
                                        />
                                        <ArrowForwardIosIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                                    </ListItemButton>
                                </ListItem>
                                {index < rules.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))}
                    </List>
                )}
                {!isLoading && !isError && rules.length === 0 && <ErrorDisplay message="No recent rules found." />}
            </Box>
            <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
                <ListItemButton component={RouterLink} to="/rules" sx={{ justifyContent: 'center', py: 0.5 }}>
                    <Typography variant="body2" sx={{fontWeight: 500}}>View All Rules</Typography>
                </ListItemButton>
            </Box>
        </Card>
    );
};

const CoverageGapsPanel: React.FC = () => {
    const { data: coverageData, isLoading, isError, error } = useTechniqueCoverageQuery();
    const navigate = useNavigate();
    const handleTechniqueClick = (technique: TechniqueCoverageDetail) => navigate('/attack-matrix', { state: { initialSearchTerm: technique.technique_id } });
    const coverageGaps = useMemo(() => coverageData?.techniques?.filter(tech => tech.count === 0).slice(0, 10) || [], [coverageData]);

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}><ReportProblemOutlinedIcon sx={{ mr: 1.5, color: 'text.secondary' }} /><Typography variant="h6">Top Coverage Gaps</Typography></Box>
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {isLoading && <List>{[...Array(5)].map((_, i) => <ListItem key={i}><Skeleton width="100%" height={40}/></ListItem>)}</List>}
                {isError && <ErrorDisplay message="Could not load coverage data." details={error?.message} />}
                {!isLoading && !isError && coverageGaps.length > 0 && (
                    <List disablePadding>
                        {coverageGaps.map((tech, index) => (
                             <React.Fragment key={tech.technique_id}>
                                <ListItem disablePadding>
                                    <ListItemButton onClick={() => handleTechniqueClick(tech)} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5 }}>
                                        <ListItemText primary={<Typography variant="body2" fontWeight={500} noWrap title={tech.name} color="text.primary">{tech.name}</Typography>} secondary={tech.technique_id} />
                                        <ArrowForwardIosIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                                    </ListItemButton>
                                </ListItem>
                                {index < coverageGaps.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))}
                    </List>
                )}
                {!isLoading && !isError && coverageGaps.length === 0 && <Box sx={{p:3, textAlign:'center'}}><Typography variant="h6" color="success.main">Excellent Coverage!</Typography><Typography variant="body2" color="text.secondary">No techniques with zero coverage found.</Typography></Box>}
            </Box>
            <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
                <ListItemButton component={RouterLink} to="/attack-matrix" sx={{ justifyContent: 'center', py: 0.5 }}>
                    <Typography variant="body2" sx={{fontWeight: 500}}>View Full Matrix</Typography>
                </ListItemButton>
            </Box>
        </Card>
    );
};

interface PlatformCoverageData { platform: string; totalTechniques: number; coveredTechniques: number; coveragePercentage: number; }
const PlatformCoveragePanel: React.FC = () => {
    const { matrix, coverage, isLoading } = useMitreAttackData();
    const platformCoverage = useMemo((): PlatformCoverageData[] => {
        if (!matrix || !coverage) return [];

        const allPlatforms = new Set<string>();
        const techniquePlatformMap = new Map<string, string[]>();
        matrix.forEach(tactic => {
            tactic.techniques.forEach(tech => {
                if (tech.platforms && !tech.is_deprecated) {
                    tech.platforms.forEach(p => allPlatforms.add(p));
                    techniquePlatformMap.set(tech.id, tech.platforms);
                }
                tech.subtechniques?.forEach(sub => {
                    if (sub.platforms && !sub.is_deprecated) {
                        sub.platforms.forEach(p => allPlatforms.add(p));
                        techniquePlatformMap.set(sub.id, sub.platforms);
                    }
                });
            });
        });
        const coveredTechniqueIds = new Set(coverage.techniques.filter(t => t.count > 0).map(t => t.technique_id));
        
        const allPlatformData: PlatformCoverageData[] = Array.from(allPlatforms).map(platform => {
            const techniquesForPlatform = Array.from(techniquePlatformMap.entries()).filter(([, platforms]) => platforms.includes(platform)).map(([techId]) => techId);
            const totalTechniques = techniquesForPlatform.length;
            const coveredTechniques = techniquesForPlatform.filter(techId => coveredTechniqueIds.has(techId)).length;
            return {
                platform,
                totalTechniques,
                coveredTechniques,
                coveragePercentage: totalTechniques > 0 ? Math.round((coveredTechniques / totalTechniques) * 100) : 0,
            };
        });

        const platformMapping: { [key: string]: string[] } = {
            "IaaS": ["IaaS", "AWS", "Azure", "GCP", "OCI"],
            "Windows": ["Windows"],
            "Linux": ["Linux"],
            "Containers": ["Containers", "Kubernetes"],
            "Network Devices": ["Network Devices"],
        };
        const reverseMapping: { [key: string]: string } = {};
        Object.keys(platformMapping).forEach(key => {
            platformMapping[key].forEach(val => {
                reverseMapping[val] = key;
            });
        });

        const aggregated: { [key: string]: { coveredTechniques: number; totalTechniques: number } } = {};
        allPlatformData.forEach(item => {
            const category = reverseMapping[item.platform];
            if (category) {
                if (!aggregated[category]) {
                    aggregated[category] = { coveredTechniques: 0, totalTechniques: 0 };
                }
                aggregated[category].coveredTechniques += item.coveredTechniques;
                aggregated[category].totalTechniques += item.totalTechniques;
            }
        });

        const finalResult = Object.keys(aggregated).map(category => ({
            platform: category,
            coveredTechniques: aggregated[category].coveredTechniques,
            totalTechniques: aggregated[category].totalTechniques,
            coveragePercentage: aggregated[category].totalTechniques > 0 ? Math.round((aggregated[category].coveredTechniques / aggregated[category].totalTechniques) * 100) : 0,
        }));

        return finalResult.sort((a, b) => b.coveragePercentage - a.coveragePercentage);
    }, [matrix, coverage]);

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}><LanguageIcon sx={{ mr: 1.5, color: 'text.secondary' }} /><Typography variant="h6">Coverage by Platform</Typography></Box>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                {isLoading && <List>{[...Array(5)].map((_, i) => <ListItem key={i}><Skeleton width="100%" height={50}/></ListItem>)}</List>}
                {!isLoading && platformCoverage.length > 0 && (
                    <List disablePadding>
                        {platformCoverage.map(item => (
                            <ListItem key={item.platform} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 1, px: 0 }}>
                                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 0.5 }}><Typography variant="body2" fontWeight="500">{item.platform}</Typography><Typography variant="body2" fontWeight="500">{item.coveragePercentage}%</Typography></Box>
                                <LinearProgress variant="determinate" value={item.coveragePercentage} sx={{ width: '100%', height: 8, borderRadius: 1 }} />
                                <Typography variant="caption" color="text.secondary" sx={{mt: 0.5}}>{item.coveredTechniques} of {item.totalTechniques} techniques covered</Typography>
                            </ListItem>
                        ))}
                    </List>
                )}
                {!isLoading && platformCoverage.length === 0 && <ErrorDisplay message="No platform data available to calculate coverage." />}
            </Box>
        </Card>
    );
};

// --- MAIN DASHBOARD COMPONENT ---
const Dashboard: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { setRulePlatforms, clearFilters } = useFilterStore();
    
    const { data: ruleStatsData, isLoading: isLoadingRuleStats, isError: isErrorRuleStats, error: errorRuleStats } = useRuleStatsQuery();
    const { data: coverageData, isLoading: isLoadingCoverage, isError: isErrorCoverage, error: errorCoverage } = useTechniqueCoverageQuery();

    const totalRules = ruleStatsData?.total_rules ?? 0;
    const statsBySeverity = ruleStatsData?.stats?.by_severity;
    const statsByRulePlatform = ruleStatsData?.stats?.by_rule_platform;
    const totalTechniques = coverageData?.total_techniques ?? 0;
    
    const coveredTechniques = useMemo(() => coverageData?.techniques?.filter(t => t.count > 0).length ?? 0, [coverageData]);
    const coveragePercentage = totalTechniques > 0 ? Math.round((coveredTechniques / totalTechniques) * 100) : 0;


    const handlePlatformClick = (platform: string) => {
        clearFilters();
        setRulePlatforms([platform]);
        navigate('/rules');
    };

    if (isErrorRuleStats || isErrorCoverage) return <Box p={3}><ErrorDisplay message="Failed to load dashboard data." details={(errorRuleStats?.message || '') + ' ' + (errorCoverage?.message || '')}/></Box>;
  
    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Row 1: Key Metrics */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard title="Total Detection Rules" value={totalRules} icon={<SecurityIcon />} isLoading={isLoadingRuleStats} color={theme.palette.primary.main} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard title="ATT&CK Techniques Tracked" value={totalTechniques} icon={<HubIcon />} isLoading={isLoadingCoverage} color={theme.palette.secondary.main} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard title="Technique Coverage" value={`${coveragePercentage}%`} icon={<AssessmentIcon />} isLoading={isLoadingCoverage} color={theme.palette.success.main}/></Grid>
            </Grid>

            {/* Row 2: Visual Breakdowns */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}><DonutLargeIcon sx={{ mr: 1.5, color: 'text.secondary' }} /><Typography variant="h6">Rules by Severity</Typography></Box>
                        <Box sx={{p: 2, flexGrow: 1}}><SeverityDonutChart data={statsBySeverity} isLoading={isLoadingRuleStats} /></Box>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <BreakdownCard
                        title="Rules by Platform"
                        data={statsByRulePlatform}
                        isLoading={isLoadingRuleStats}
                        colorMap={PLATFORM_COLORS}
                        icon={<LanguageIcon />}
                        onItemClick={handlePlatformClick}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <PlatformCoveragePanel />
                </Grid>
            </Grid>
            
            {/* Row 3: Actionable Insights */}
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}><CoverageGapsPanel /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><RecentActivityPanel /></Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;