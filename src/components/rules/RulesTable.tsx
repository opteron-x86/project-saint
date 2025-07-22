import React, { useEffect, useMemo } from 'react';
<<<<<<< HEAD
<<<<<<< HEAD
import { Box, Typography, Chip, useTheme } from '@mui/material';
=======
import {
  Box,
  Typography,
  Chip,
  useTheme,
} from '@mui/material';
>>>>>>> a380730 (Initial deployment)
=======
import { Box, Typography, Chip, useTheme } from '@mui/material';
>>>>>>> d8f7497 (updated rulecard, ruledetail, rulestable)
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridSortModel,
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
} from '@mui/x-data-grid';

import { RuleSummary, RuleSeverity } from '@/api/types';
import { StatusBadge } from '@/components/common';
import { formatDate } from '@/utils/format';
import { SEVERITY_DISPLAY, PAGE_SIZES } from '@/utils/constants';

interface RulesTableProps {
  rules: RuleSummary[];
=======
  GridRenderCellParams,
=======
  GridRenderCellParams, // Keep if used by externalColumns, though default ones don't need it now
>>>>>>> d8f7497 (updated rulecard, ruledetail, rulestable)
=======
>>>>>>> bae12e2 (Feature/dashboard improvements)
} from '@mui/x-data-grid';

import { RuleSummary, RuleSeverity } from '@/api/types';
import { StatusBadge } from '@/components/common';
import { formatDate } from '@/utils/format';
import { SEVERITY_DISPLAY, PAGE_SIZES } from '@/utils/constants';

interface RulesTableProps {
<<<<<<< HEAD
<<<<<<< HEAD
  rules: Rule[];
>>>>>>> a380730 (Initial deployment)
=======
  rules: RuleSummary[]; // Changed from Rule[] to RuleSummary[]
>>>>>>> d8f7497 (updated rulecard, ruledetail, rulestable)
=======
  rules: RuleSummary[];
>>>>>>> bae12e2 (Feature/dashboard improvements)
  totalRules: number;
  currentPage: number;
  pageSize: number;
  sortModel: GridSortModel;
  isLoading: boolean;
  onPaginationChange: (page: number, pageSize?: number) => void;
  onSortChange: (model: GridSortModel) => void;
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  onRuleSelect: (rule: RuleSummary) => void;
  columns?: GridColDef<RuleSummary>[];
=======
  onRuleSelect: (rule: Rule) => void;
  /** optional custom column set */
  columns?: GridColDef[];
>>>>>>> a380730 (Initial deployment)
=======
  onRuleSelect: (rule: RuleSummary) => void; // Changed from Rule to RuleSummary
  columns?: GridColDef<RuleSummary>[]; // Ensure external columns also expect RuleSummary
  // onRuleBookmark?: (ruleId: string) => void; // Optional: if table rows have bookmark actions
  // isBookmarked?: (ruleId: string) => boolean; // Optional: if table rows show bookmark status
>>>>>>> d8f7497 (updated rulecard, ruledetail, rulestable)
=======
  onRuleSelect: (rule: RuleSummary) => void;
  columns?: GridColDef<RuleSummary>[];
>>>>>>> bae12e2 (Feature/dashboard improvements)
}

const RulesTable: React.FC<RulesTableProps> = ({
  rules,
  totalRules,
  currentPage,
  pageSize,
  sortModel,
  isLoading,
  onPaginationChange,
  onSortChange,
  onRuleSelect,
  columns: externalColumns,
}) => {
  const theme = useTheme();

<<<<<<< HEAD
<<<<<<< HEAD
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('RulesTable updated with:', { numRules: rules.length, totalRules, isLoading });
    }
  }, [rules, totalRules, isLoading]);

  const processedRules = useMemo(
    () =>
      rules.map((r) => ({
        ...r,
=======
  /* ─────────────────────  diagnostics in dev  ───────────────────── */
=======
>>>>>>> d8f7497 (updated rulecard, ruledetail, rulestable)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('RulesTable updated with:', { numRules: rules.length, totalRules, isLoading });
    }
  }, [rules, totalRules, isLoading]);

  const processedRules = useMemo(
    () =>
      rules.map((r) => ({
        ...r,
<<<<<<< HEAD
<<<<<<< HEAD
        id: r.id ?? `row-${idx}-${Math.random().toString(36).slice(2, 7)}`,
>>>>>>> a380730 (Initial deployment)
=======
        // Ensure defaults if any field in RuleSummary could be undefined but table expects string
>>>>>>> d8f7497 (updated rulecard, ruledetail, rulestable)
=======
>>>>>>> bae12e2 (Feature/dashboard improvements)
        title: r.title ?? 'Untitled Rule',
        severity: r.severity ?? 'unknown',
        rule_source: r.rule_source ?? 'unknown',
        created_date: r.created_date ?? '',
        modified_date: r.modified_date ?? '',
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        platforms: r.platforms ?? [],
      })),
    [rules]
  );

  const defaultColumnsInternal: GridColDef<RuleSummary>[] = [
    {
      field: 'title', headerName: 'Title', flex: 1.5, minWidth: 200,
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight={500} noWrap>
          {row.title}
=======
        platforms: Array.isArray(r.platforms) ? r.platforms : [],
        tactics: Array.isArray(r.tactics) ? r.tactics : [],
        techniques: Array.isArray(r.techniques) ? r.techniques : [],
        subtechniques: Array.isArray(r.subtechniques) ? r.subtechniques : [],
=======
        platforms: r.platforms ?? [], // RuleSummary now has platforms directly
>>>>>>> d8f7497 (updated rulecard, ruledetail, rulestable)
=======
        platforms: r.platforms ?? [],
>>>>>>> bae12e2 (Feature/dashboard improvements)
      })),
    [rules]
  );

  const defaultColumnsInternal: GridColDef<RuleSummary>[] = [
    {
      field: 'title', headerName: 'Title', flex: 1.5, minWidth: 200,
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight={500} noWrap>
<<<<<<< HEAD
          {value ?? 'Untitled'}
>>>>>>> a380730 (Initial deployment)
=======
          {row.title}
>>>>>>> d8f7497 (updated rulecard, ruledetail, rulestable)
        </Typography>
      ),
    },
    {
<<<<<<< HEAD
<<<<<<< HEAD
      field: 'severity', headerName: 'Severity', width: 120,
      renderCell: ({ row }) => (
        <StatusBadge
          label={SEVERITY_DISPLAY[row.severity as RuleSeverity] ?? row.severity}
          status={(row.severity ?? 'unknown').toLowerCase()}
=======
      field: 'severity',
      headerName: 'Severity',
      width: 120,
      renderCell: ({ value }) => (
        <StatusBadge
          label={value ?? 'unknown'}
          status={(value ?? 'unknown').toLowerCase()}
>>>>>>> a380730 (Initial deployment)
=======
      field: 'severity', headerName: 'Severity', width: 120,
      renderCell: ({ row }) => (
        <StatusBadge
          label={SEVERITY_DISPLAY[row.severity as RuleSeverity] ?? row.severity}
          status={(row.severity ?? 'unknown').toLowerCase()}
>>>>>>> d8f7497 (updated rulecard, ruledetail, rulestable)
          size="small"
        />
      ),
    },
    {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> d8f7497 (updated rulecard, ruledetail, rulestable)
      field: 'platforms', headerName: 'Platforms', width: 160,
      renderCell: ({ row }) => {
        if (!row.platforms || row.platforms.length === 0) return '-';
        const displayed = row.platforms.slice(0, 2);
        const overflow = row.platforms.length - displayed.length;
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {displayed.map((item) => (<Chip key={item} label={item} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />))}
            {overflow > 0 && (<Chip label={`+${overflow}`} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: theme.palette.grey[200], color: theme.palette.grey[700] }} />)}
          </Box>
        );
      },
<<<<<<< HEAD
    },
    { field: 'rule_source', headerName: 'Source', width: 120, renderCell: ({ value }) => (<Chip label={value} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />) },
    { field: 'created_date', headerName: 'Created', width: 130, renderCell: ({ row }) => (row.created_date ? formatDate(row.created_date) : '-') },
  ];

  const columnsToUse = externalColumns ?? defaultColumnsInternal;

  // Manually handle pagination model changes since the footer is hidden
  useEffect(() => {
    const handlePagination = () => {
      // This is a workaround to keep DataGrid's internal state in sync
      // It doesn't trigger a re-fetch if the values are the same
      onPaginationChange(currentPage, pageSize);
    };
    handlePagination();
  }, [currentPage, pageSize, onPaginationChange]);


  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <DataGrid<RuleSummary>
        rows={processedRules}
        columns={columnsToUse}
        loading={isLoading}
        rowCount={totalRules}
        pageSizeOptions={PAGE_SIZES}
        paginationModel={{ page: currentPage - 1, pageSize }}
        paginationMode="server"
        sortingMode="server"
        onSortModelChange={onSortChange}
        sortModel={sortModel}
        getRowId={(row) => row.id}
        onRowClick={(params: GridRowParams<RuleSummary>) => onRuleSelect(params.row)}
        disableRowSelectionOnClick
        hideFooter // Hides the entire default footer
        sx={{
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' },
          '& .MuiDataGrid-columnHeader': { backgroundColor: 'background.paper' },
          border: 0,
        }}
        localeText={{ noRowsLabel: 'No rules found' }}
=======
      field: 'rule_source',
      headerName: 'Source',
      width: 120,
      renderCell: ({ value }) => (
        <Chip
          label={value}
          size="small"
          sx={{ height: 20, fontSize: '0.7rem' }}
        />
      ),
    },
    {
      field: 'created_date',
      headerName: 'Created',
      width: 130,
      renderCell: ({ row }) =>
        row.created_date ? formatDate(row.created_date) : '-',
    },
    {
      field: 'platforms',
      headerName: 'Platforms',
      width: 160,
      renderCell: (p) => arrayToChips(p.row.platforms || [], p),
    },
    {
      field: 'tactics',
      headerName: 'Tactics',
      width: 170,
      renderCell: (p) => arrayToChips(p.row.tactics || [], p),
    },
    {
      field: 'techniques',
      headerName: 'Techniques',
      width: 190,
      renderCell: (p) =>
        arrayToChips(
          [...(p.row.techniques || []), ...(p.row.subtechniques || [])],
          p,
        ),
    },
    {
      field: 'modified_date',
      headerName: 'Modified',
      width: 130,
      renderCell: ({ row }) =>
        row.modified_date ? formatDate(row.modified_date) : '-',
=======
>>>>>>> d8f7497 (updated rulecard, ruledetail, rulestable)
    },
    { field: 'rule_source', headerName: 'Source', width: 120, renderCell: ({ value }) => (<Chip label={value} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />) },
    { field: 'created_date', headerName: 'Created', width: 130, renderCell: ({ row }) => (row.created_date ? formatDate(row.created_date) : '-') },
  ];

  const columnsToUse = externalColumns ?? defaultColumnsInternal;

  // Manually handle pagination model changes since the footer is hidden
  useEffect(() => {
    const handlePagination = () => {
      // This is a workaround to keep DataGrid's internal state in sync
      // It doesn't trigger a re-fetch if the values are the same
      onPaginationChange(currentPage, pageSize);
    };
    handlePagination();
  }, [currentPage, pageSize, onPaginationChange]);


  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <DataGrid<RuleSummary>
        rows={processedRules}
        columns={columnsToUse}
        loading={isLoading}
        rowCount={totalRules}
        pageSizeOptions={PAGE_SIZES}
        paginationModel={{ page: currentPage - 1, pageSize }}
        paginationMode="server"
        sortingMode="server"
        onSortModelChange={onSortChange}
        sortModel={sortModel}
        getRowId={(row) => row.id}
        onRowClick={(params: GridRowParams<RuleSummary>) => onRuleSelect(params.row)}
        disableRowSelectionOnClick
        hideFooter // Hides the entire default footer
        sx={{
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' },
          '& .MuiDataGrid-columnHeader': { backgroundColor: 'background.paper' },
          border: 0,
        }}
        localeText={{ noRowsLabel: 'No rules found' }}
<<<<<<< HEAD
<<<<<<< HEAD
        initialState={{
          columns: {
            columnVisibilityModel: { modified_date: false },
          },
        }}
>>>>>>> a380730 (Initial deployment)
=======
        // initialState is now managed by `sortModel` prop for controlled sorting
>>>>>>> d8f7497 (updated rulecard, ruledetail, rulestable)
=======
>>>>>>> bae12e2 (Feature/dashboard improvements)
      />
    </Box>
  );
};

<<<<<<< HEAD
<<<<<<< HEAD
export default RulesTable;
=======
export default RulesTable;
>>>>>>> a380730 (Initial deployment)
=======
export default RulesTable;
>>>>>>> d8f7497 (updated rulecard, ruledetail, rulestable)
