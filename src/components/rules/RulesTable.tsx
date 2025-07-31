import React, { useEffect, useMemo } from 'react';
import { Box, Typography, Chip, useTheme } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridSortModel,
} from '@mui/x-data-grid';

import { RuleSummary, RuleSeverity } from '@/api/types';
import { StatusBadge } from '@/components/common';
import { formatDate } from '@/utils/format';
import { SEVERITY_DISPLAY, PAGE_SIZES } from '@/utils/constants';

interface RulesTableProps {
  rules: RuleSummary[];
  totalRules: number;
  currentPage: number;
  pageSize: number;
  sortModel: GridSortModel;
  isLoading: boolean;
  onPaginationChange: (page: number, pageSize?: number) => void;
  onSortChange: (model: GridSortModel) => void;
  onRuleSelect: (rule: RuleSummary) => void;
  columns?: GridColDef<RuleSummary>[];
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

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('RulesTable updated with:', { numRules: rules.length, totalRules, isLoading });
    }
  }, [rules, totalRules, isLoading]);

  const processedRules = useMemo(
    () =>
      rules.map((r) => ({
        ...r,
        title: r.title ?? 'Untitled Rule',
        severity: r.severity ?? 'unknown',
        rule_source: r.rule_source ?? 'unknown',
        created_date: r.created_date ?? '',
        modified_date: r.modified_date ?? '',
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
        </Typography>
      ),
    },
    {
      field: 'severity', headerName: 'Severity', width: 120,
      renderCell: ({ row }) => (
        <StatusBadge
          label={SEVERITY_DISPLAY[row.severity as RuleSeverity] ?? row.severity}
          status={(row.severity ?? 'unknown').toLowerCase()}
          size="small"
        />
      ),
    },
    {
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
      />
    </Box>
  );
};

export default RulesTable;