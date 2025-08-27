// src/components/rules/RulesTable.tsx
import React, { useMemo, useCallback } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridSortModel,
  GridPaginationModel,
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
  totalRules: number;
  currentPage: number;
  pageSize: number;
  sortModel?: GridSortModel;
  isLoading?: boolean;
  onRuleSelect: (rule: RuleSummary) => void;
  onPaginationChange: (page: number, pageSize?: number) => void;
  onSortChange?: (model: GridSortModel) => void;
  onBookmark?: (ruleId: string) => void;
  bookmarkedRuleIds?: Set<string>;
  columns?: GridColDef<RuleSummary>[];
}

const RulesTable: React.FC<RulesTableProps> = ({
  rules,
  totalRules,
  currentPage,
  pageSize,
  sortModel,
  isLoading = false,
  onRuleSelect,
  onPaginationChange,
  onSortChange,
  onBookmark,
  bookmarkedRuleIds = new Set(),
  columns: externalColumns,
}) => {
  const theme = useTheme();

  // Process rules to ensure consistent data structure
  const processedRules = useMemo(
    () =>
      rules.map((r) => ({
        ...r,
        // Ensure id is always present for DataGrid
        id: r.id,
        // Map any legacy fields if needed
        severity: r.severity || 'unknown',
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
          {row.title}
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
      field: 'rule_source',
      headerName: 'Source',
      width: 140,
      sortable: true,
      renderCell: ({ row }) => (
        <Typography variant="body2" noWrap>
          {row.rule_source}
        </Typography>
      ),
    },
    {
      field: 'platforms',
      headerName: 'Platforms',
      width: 180,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          {(row.platforms || []).slice(0, 2).map((platform) => (
            <Chip key={platform} label={platform} size="small" variant="outlined" />
          ))}
          {(row.platforms || []).length > 2 && (
            <Chip label={`+${(row.platforms || []).length - 2}`} size="small" variant="outlined" />
          )}
        </Stack>
      ),
    },
    {
      field: 'modified_date',
      headerName: 'Last Modified',
      width: 140,
      sortable: true,
      renderCell: ({ row }) => (
        <Typography variant="body2" noWrap>
          {row.modified_date ? formatDate(row.modified_date) : '-'}
        </Typography>
      ),
    },
    {
      field: 'has_mitre_mapping',
      headerName: 'MITRE',
      width: 80,
      sortable: true,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <Chip
          label={row.has_mitre_mapping ? 'Yes' : 'No'}
          size="small"
          color={row.has_mitre_mapping ? 'success' : 'default'}
          variant={row.has_mitre_mapping ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'has_cve_references',
      headerName: 'CVEs',
      width: 80,
      sortable: true,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <Chip
          label={row.has_cve_references ? 'Yes' : 'No'}
          size="small"
          color={row.has_cve_references ? 'warning' : 'default'}
          variant={row.has_cve_references ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onBookmark?.(row.id);
          }}
        >
          {bookmarkedRuleIds.has(row.id) ? (
            <BookmarkIcon fontSize="small" color="primary" />
          ) : (
            <BookmarkBorderIcon fontSize="small" />
          )}
        </IconButton>
      ),
    },
  ];

  const columns = externalColumns || defaultColumnsInternal;

  const handleRowClick = useCallback(
    (params: GridRowParams<RuleSummary>) => {
      if (onRuleSelect) {
        onRuleSelect(params.row);
      }
    },
    [onRuleSelect]
  );


  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <DataGrid
        rows={processedRules}
        columns={columns}
        loading={isLoading}
        rowCount={totalRules}
        
        // pageSizeOptions={[10, 25, 50, 100]}
        // paginationMode="server"
        // paginationModel={{ page: currentPage, pageSize }}
        // onPaginationModelChange={handlePaginationModelChange}
        
        //  HIDE PAGINATION:
        hideFooterPagination
        hideFooter // This completely hides the footer including pagination
        
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={onSortChange}
        onRowClick={handleRowClick}
        disableRowSelectionOnClick
        disableColumnMenu
        autoHeight={false}
        sx={{
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.background.default,
            borderBottom: `2px solid ${theme.palette.divider}`,
          },
          // REMOVE THIS SINCE FOOTER IS HIDDEN:
          // '& .MuiDataGrid-footerContainer': {
          //   borderTop: `2px solid ${theme.palette.divider}`,
          // },
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          },
        }}
      />
    </Box>
  );
};

export default RulesTable;