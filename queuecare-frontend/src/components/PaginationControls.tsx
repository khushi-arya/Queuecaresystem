import React from 'react';
import {
  Box,
  Pagination,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
} from '@mui/material';

interface PaginationControlsProps {
  /**
   * Current page number (1-indexed)
   */
  page: number;

  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Items per page
   */
  pageSize: number;

  /**
   * Total number of items
   */
  totalItems: number;

  /**
   * Callback when page changes
   */
  onPageChange: (page: number) => void;

  /**
   * Callback when page size changes
   */
  onPageSizeChange?: (pageSize: number) => void;

  /**
   * Available page sizes
   * @default [5, 10, 25, 50]
   */
  pageSizeOptions?: number[];

  /**
   * Show page size selector
   * @default true
   */
  showPageSize?: boolean;

  /**
   * Show total items info
   * @default true
   */
  showTotalItems?: boolean;

  /**
   * Disable pagination
   * @default false
   */
  disabled?: boolean;
}

/**
 * PaginationControls Component
 * Provides pagination UI with page size selector
 *
 * @example
 * // Basic pagination
 * <PaginationControls
 *   page={1}
 *   totalPages={10}
 *   pageSize={10}
 *   totalItems={100}
 *   onPageChange={(page) => setPage(page)}
 * />
 *
 * @example
 * // With page size control
 * <PaginationControls
 *   page={1}
 *   totalPages={10}
 *   pageSize={10}
 *   totalItems={100}
 *   onPageChange={(page) => setPage(page)}
 *   onPageSizeChange={(size) => setPageSize(size)}
 *   pageSizeOptions={[5, 10, 25]}
 * />
 */
export const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50],
  showPageSize = true,
  showTotalItems = true,
  disabled = false,
}) => {
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        py: 2,
        px: 1,
      }}
    >
      {/* Left side: Total items info */}
      {showTotalItems && (
        <Typography variant="body2" color="text.secondary">
          Showing {startItem} to {endItem} of {totalItems} items
        </Typography>
      )}

      {/* Middle/Right side: Page size and pagination */}
      <Stack direction="row" spacing={2} alignItems="center">
        {/* Page size selector */}
        {showPageSize && onPageSizeChange && (
          <FormControl size="small" sx={{ minWidth: 100 }} disabled={disabled}>
            <InputLabel>Items per page</InputLabel>
            <Select
              value={pageSize}
              label="Items per page"
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Pagination */}
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, newPage) => onPageChange(newPage)}
          shape="rounded"
          disabled={disabled || totalPages <= 1}
          sx={{
            '& .MuiPaginationItem-root': {
              borderRadius: 1,
            },
          }}
        />
      </Stack>
    </Box>
  );
};

export default PaginationControls;
