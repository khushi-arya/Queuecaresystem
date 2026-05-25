import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';
/**
 * ConfirmDialog Component
 * Modal dialog for confirming user actions (delete, cancel, etc.)
 *
 * @example
 * // Delete confirmation
 * <ConfirmDialog
 *   title="Delete Appointment"
 *   message="Are you sure you want to delete this appointment? This cannot be undone."
 *   open={showDialog}
 *   type="warning"
 *   confirmText="Delete"
 *   onConfirm={() => handleDelete()}
 *   onCancel={() => setShowDialog(false)}
 * />
 *
 * @example
 * // Info confirmation
 * <ConfirmDialog
 *   title="Confirm Action"
 *   message="Are you sure you want to proceed?"
 *   open={showDialog}
 *   type="info"
 *   onConfirm={() => handleAction()}
 *   onCancel={() => setShowDialog(false)}
 * />
 */
export const ConfirmDialog = ({ title, message, open, type = 'warning', confirmText = 'Confirm', cancelText = 'Cancel', confirmDisabled = false, confirmLoading = false, onConfirm, onCancel, }) => {
    const getIcon = () => {
        switch (type) {
            case 'warning':
                return _jsx(WarningIcon, { sx: { fontSize: 48, color: 'warning.main', mb: 1 } });
            case 'error':
                return _jsx(WarningIcon, { sx: { fontSize: 48, color: 'error.main', mb: 1 } });
            case 'info':
                return _jsx(InfoIcon, { sx: { fontSize: 48, color: 'info.main', mb: 1 } });
            default:
                return _jsx(HelpIcon, { sx: { fontSize: 48, color: 'primary.main', mb: 1 } });
        }
    };
    const getConfirmColor = () => {
        switch (type) {
            case 'warning':
            case 'error':
                return 'error';
            default:
                return 'primary';
        }
    };
    return (_jsxs(Dialog, { open: open, onClose: onCancel, maxWidth: "sm", fullWidth: true, PaperProps: {
            sx: {
                borderRadius: 2,
            },
        }, children: [_jsxs(DialogTitle, { sx: { pt: 3 }, children: [_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', mb: 1 }, children: getIcon() }), _jsx(Typography, { variant: "h6", align: "center", sx: { mt: 1 }, children: title })] }), _jsx(DialogContent, { sx: { py: 2 }, children: _jsx(Typography, { variant: "body2", color: "text.secondary", align: "center", children: message }) }), _jsxs(DialogActions, { sx: { p: 2, gap: 1 }, children: [_jsx(Button, { onClick: onCancel, variant: "outlined", fullWidth: true, sx: { order: 1 }, children: cancelText }), _jsx(Button, { onClick: onConfirm, variant: "contained", color: getConfirmColor(), disabled: confirmDisabled || confirmLoading, fullWidth: true, sx: { order: 2 }, children: confirmLoading ? 'Processing...' : confirmText })] })] }));
};
export default ConfirmDialog;
