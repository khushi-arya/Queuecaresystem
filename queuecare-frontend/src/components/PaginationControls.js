import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box, Pagination, Typography, MenuItem, Select, FormControl, InputLabel, Stack, } from '@mui/material';
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
export const PaginationControls = ({ page, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange, pageSizeOptions = [5, 10, 25, 50], showPageSize = true, showTotalItems = true, disabled = false, }) => {
    const startItem = (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, totalItems);
    return (_jsxs(Box, { sx: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            py: 2,
            px: 1,
        }, children: [showTotalItems && (_jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["Showing ", startItem, " to ", endItem, " of ", totalItems, " items"] })), _jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [showPageSize && onPageSizeChange && (_jsxs(FormControl, { size: "small", sx: { minWidth: 100 }, disabled: disabled, children: [_jsx(InputLabel, { children: "Items per page" }), _jsx(Select, { value: pageSize, label: "Items per page", onChange: (e) => onPageSizeChange(Number(e.target.value)), children: pageSizeOptions.map((size) => (_jsx(MenuItem, { value: size, children: size }, size))) })] })), _jsx(Pagination, { count: totalPages, page: page, onChange: (_, newPage) => onPageChange(newPage), shape: "rounded", disabled: disabled || totalPages <= 1, sx: {
                            '& .MuiPaginationItem-root': {
                                borderRadius: 1,
                            },
                        } })] })] }));
};
export default PaginationControls;
