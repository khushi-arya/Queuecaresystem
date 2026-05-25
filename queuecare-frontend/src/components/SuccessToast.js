import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
/**
 * SuccessToast Component
 * Displays a temporary notification toast message
 *
 * @example
 * // Basic success toast
 * <SuccessToast message="Operation successful!" open={true} />
 *
 * @example
 * // With custom duration
 * <SuccessToast
 *   message="Saved successfully"
 *   open={true}
 *   duration={3000}
 * />
 *
 * @example
 * // Warning toast with close callback
 * <SuccessToast
 *   message="Warning: This action cannot be undone"
 *   severity="warning"
 *   open={true}
 *   onClose={() => setToastOpen(false)}
 * />
 */
export const SuccessToast = ({ message, open = false, duration = 4000, severity = 'success', vertical = 'bottom', horizontal = 'right', onClose, }) => {
    const [isOpen, setIsOpen] = useState(open);
    useEffect(() => {
        setIsOpen(open);
    }, [open]);
    const handleClose = () => {
        setIsOpen(false);
        onClose?.();
    };
    return (_jsx(Snackbar, { open: isOpen, autoHideDuration: duration, onClose: handleClose, anchorOrigin: { vertical, horizontal }, children: _jsx(Alert, { onClose: handleClose, severity: severity, variant: "filled", sx: {
                width: '100%',
                minWidth: '300px',
                boxShadow: (theme) => theme.palette.mode === 'light'
                    ? '0 4px 12px rgba(0, 0, 0, 0.15)'
                    : '0 4px 12px rgba(0, 0, 0, 0.45)',
            }, children: message }) }));
};
export default SuccessToast;
