// src/components/rules/RulesTable.tsx
import React, { useMemo, useState, useCallback } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridSortModel,
  GridColumnHeaderParams,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import {
  Box,
  Typography,
  Chip,
  useTheme,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { RuleSummary, RuleSeverity } from '@/api/types';
import { StatusBadge } from '@/components/common';
import { SEVERITY_DISPLAY } from '@/utils/constants';
import { formatDate } from '@/utils/format';

interface RulesTableProps {
  rules: RuleSummary[];
  isLoading?: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRowClick?: (rule: RuleSummary) => void;
  onBookmark?: (ruleId: string) => void;
  bookmarkedRuleIds?: Set<string>;
  sortModel?: GridSortModel;
  onSortModelChange?: (model: GridSortModel) => void;
  columns?: GridColDef<RuleSummary>[];
}

const RulesTable: React.FC<RulesTableProps> = ({
  rules,
  isLoading = false,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  onBookmark,
  bookmarkedRuleIds = new Set(),
  sortModel,
  onSortModelChange,
  columns: externalColumns,
}) => {
  const theme = useTheme();

  // Map rules to include proper fields based on API response
  const processedRules = useMemo(
    () =>
      rules.map((r) => ({
        ...r,
        id: r.id || r.rule_id,
        title: r.name || r.title,
        severity: r.severity || 'unknown',
        rule_source: r.source?.name || 'Unknown',
        source_id: r.source?.id,
        // API doesn't return these fields, so we'll handle them gracefully
        created_date: r.created_date || null,
        platforms: r.platforms || [],
      })),
    [rules]
  );

  const defaultColumnsInternal: GridColDef<RuleSummary>[] = [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1.5,
      minWidth: 200,
      sortable: true,
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight={500} noWrap>
          {row.title || row.name}
        </Typography>
      ),
    },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 120,
      sortable: true,
      renderCell: ({ row }) => (
        <StatusBadge
          label={SEVERITY_DISPLAY[row.severity as RuleSeverity] ?? row.severity}
          status={(row.severity ?? 'unknown').toLowerCase()}
          size="small"
        />
      ),
    },
    {
      field: 'rule_type',
      headerName: 'Type',
      width: 140,
      sortable: true,
      renderCell: ({ value }) =>
        value ? (
          <Chip label={value.toUpperCase()} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
        ) : (
          '-'
        ),
    },
    {
      field: 'rule_source',
      headerName: 'Source',
      width: 150,
      sortable: false, // Backend doesn't support sorting by source name
      renderCell: ({ row }) => (
        <Chip
          label={row.rule_source || 'Unknown'}
          size="small"
          sx={{ height: 20, fontSize: '0.7rem' }}
        />
      ),
    },
    {
      field: 'updated_date',
      headerName: 'Last Updated',
      width: 130,
      sortable: true,
      renderCell: ({ row }) => (row.updated_date ? formatDate(row.updated_date) : '-'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          {onBookmark && (
            <Tooltip title={bookmarkedRuleIds.has(String(row.id)) ? 'Remove bookmark' : 'Add bookmark'}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark(String(row.id));
                }}
              >
                {bookmarkedRuleIds.has(String(row.id)) ? (
                  <BookmarkIcon fontSize="small" color="primary" />
                ) : (
                  <BookmarkBorderIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  const columnsToUse = externalColumns ?? defaultColumnsInternal;

  // Handle sorting changes
  const handleSortModelChange = useCallback(
    (model: GridSortModel) => {
      if (onSortModelChange) {
        onSortModelChange(model);
      }
    },
    [onSortModelChange]
  );

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <DataGrid
        rows={processedRules}
        columns={columnsToUse}
        loading={isLoading}
        page={page - 1} // DataGrid uses 0-based indexing
        pageSize={pageSize}
        rowCount={totalCount}
        paginationMode="server"
        sortingMode="server"
        onPageChange={(newPage) => onPageChange(newPage + 1)}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={[10, 25, 50, 100]}
        onRowClick={(params: GridRowParams<RuleSummary>) => onRowClick?.(params.row)}
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        disableRowSelectionOnClick
        disableColumnFilter
        autoHeight={false}
        density="comfortable"
        sx={{
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          },
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.background.default,
            borderBottom: `2px solid ${theme.palette.divider}`,
          },
        }}
      />
    </Box>
  );
};

export default RulesTable;