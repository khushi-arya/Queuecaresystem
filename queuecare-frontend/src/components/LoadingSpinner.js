import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, CircularProgress, Backdrop, Typography } from '@mui/material';
/**
 * LoadingSpinner Component
 * Displays a circular progress spinner with optional backdrop
 *
 * @example
 * // Basic usage
 * <LoadingSpinner />
 *
 * @example
 * // With custom message
 * <LoadingSpinner message="Loading data..." />
 *
 * @example
 * // Compact version
 * <LoadingSpinner fullscreen={false} size={30} />
 */
export const LoadingSpinner = ({ fullscreen = true, message, size = 40, backdrop = true, backdropOpacity = 0.5, }) => {
    const spinnerContent = (_jsxs(Box, { sx: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
        }, children: [_jsx(CircularProgress, { size: size }), message && (_jsx(Typography, { variant: "body2", sx: { color: 'text.secondary', mt: 1 }, children: message }))] }));
    if (fullscreen && backdrop) {
        return (_jsx(Backdrop, { sx: {
                color: '#fff',
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})`,
            }, open: true, children: spinnerContent }));
    }
    if (fullscreen) {
        return (_jsx(Box, { sx: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: (theme) => theme.zIndex.drawer + 1,
            }, children: spinnerContent }));
    }
    return spinnerContent;
};
export default LoadingSpinner;
