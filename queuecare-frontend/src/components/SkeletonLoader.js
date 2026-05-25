import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Skeleton, Stack, Box } from '@mui/material';
/**
 * SkeletonLoader Component
 * Displays loading placeholders for better perceived performance
 * Improves UX by showing skeleton instead of blank space
 *
 * @example
 * // Single table row
 * <SkeletonLoader variant="row" count={5} />
 *
 * @example
 * // Card skeleton
 * <SkeletonLoader variant="card" count={3} />
 *
 * @example
 * // User profile card
 * <SkeletonLoader variant="user-card" />
 */
export const SkeletonLoader = ({ variant = 'row', count = 3, height = '40px', width = '100%', animation = 'wave', sx = {}, }) => {
    if (variant === 'row') {
        return (_jsx(Stack, { spacing: 1, sx: sx, children: Array.from({ length: count }).map((_, idx) => (_jsx(Skeleton, { variant: "rectangular", height: height, width: width, animation: animation, sx: { borderRadius: 1 } }, idx))) }));
    }
    if (variant === 'table') {
        return (_jsxs(Box, { sx: sx, children: [_jsxs(Box, { sx: { display: 'flex', gap: 1, mb: 2 }, children: [_jsx(Skeleton, { variant: "rectangular", width: "15%", height: 40, animation: animation }), _jsx(Skeleton, { variant: "rectangular", width: "20%", height: 40, animation: animation }), _jsx(Skeleton, { variant: "rectangular", width: "25%", height: 40, animation: animation }), _jsx(Skeleton, { variant: "rectangular", width: "20%", height: 40, animation: animation }), _jsx(Skeleton, { variant: "rectangular", width: "20%", height: 40, animation: animation })] }), _jsx(Stack, { spacing: 1, children: Array.from({ length: count }).map((_, idx) => (_jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [_jsx(Skeleton, { variant: "rectangular", width: "15%", height: 50, animation: animation }), _jsx(Skeleton, { variant: "rectangular", width: "20%", height: 50, animation: animation }), _jsx(Skeleton, { variant: "rectangular", width: "25%", height: 50, animation: animation }), _jsx(Skeleton, { variant: "rectangular", width: "20%", height: 50, animation: animation }), _jsx(Skeleton, { variant: "rectangular", width: "20%", height: 50, animation: animation })] }, idx))) })] }));
    }
    if (variant === 'card') {
        return (_jsx(Stack, { spacing: 2, sx: sx, children: Array.from({ length: count }).map((_, idx) => (_jsxs(Box, { sx: {
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                }, children: [_jsx(Skeleton, { variant: "rectangular", height: 20, width: "60%", sx: { mb: 1 }, animation: animation }), _jsx(Skeleton, { variant: "rectangular", height: 16, width: "100%", sx: { mb: 1 }, animation: animation }), _jsx(Skeleton, { variant: "rectangular", height: 16, width: "90%", animation: animation })] }, idx))) }));
    }
    if (variant === 'list') {
        return (_jsx(Stack, { spacing: 2, sx: sx, children: Array.from({ length: count }).map((_, idx) => (_jsxs(Box, { sx: { display: 'flex', gap: 2, alignItems: 'center' }, children: [_jsx(Skeleton, { variant: "circular", width: 40, height: 40, animation: animation }), _jsxs(Box, { sx: { flex: 1 }, children: [_jsx(Skeleton, { variant: "rectangular", height: 20, width: "70%", sx: { mb: 1 }, animation: animation }), _jsx(Skeleton, { variant: "rectangular", height: 16, width: "100%", animation: animation })] })] }, idx))) }));
    }
    if (variant === 'user-card') {
        return (_jsxs(Box, { sx: { textAlign: 'center', ...sx }, children: [_jsx(Skeleton, { variant: "circular", width: 80, height: 80, sx: { mx: 'auto', mb: 2 }, animation: animation }), _jsx(Skeleton, { variant: "rectangular", height: 24, width: "60%", sx: { mx: 'auto', mb: 1 }, animation: animation }), _jsx(Skeleton, { variant: "rectangular", height: 16, width: "80%", sx: { mx: 'auto', mb: 2 }, animation: animation }), _jsx(Skeleton, { variant: "rectangular", height: 40, width: "100%", animation: animation })] }));
    }
    return _jsx(Skeleton, { variant: "rectangular", height: height, width: width, animation: animation });
};
export default SkeletonLoader;
