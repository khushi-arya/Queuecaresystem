import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Alert, AlertTitle, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
/**
 * ErrorAlert Component
 * Displays error messages in an alert box with optional close button
 *
 * @example
 * // Basic error alert
 * <ErrorAlert message="Something went wrong" />
 *
 * @example
 * // With multiple messages
 * <ErrorAlert
 *   message={["Validation failed", "Email is invalid"]}
 *   title="Form Errors"
 * />
 *
 * @example
 * // With close callback
 * <ErrorAlert
 *   message="An error occurred"
 *   onClose={() => setError(null)}
 * />
 */
export const ErrorAlert = ({ message, title = 'Error', closeable = true, onClose, severity = 'error', sx, }) => {
    const messages = Array.isArray(message) ? message : [message];
    return (_jsxs(Alert, { severity: severity, sx: {
            mb: 2,
            ...sx,
        }, action: closeable && onClose ? (_jsx(IconButton, { size: "small", color: "inherit", onClick: onClose, sx: { ml: 1 }, children: _jsx(CloseIcon, { fontSize: "small" }) })) : undefined, children: [title && _jsx(AlertTitle, { children: title }), _jsx(Box, { children: messages.length === 1 ? (_jsx("span", { children: messages[0] })) : (_jsx("ul", { style: { margin: '8px 0 0 0', paddingLeft: '20px' }, children: messages.map((msg, index) => (_jsx("li", { children: msg }, index))) })) })] }));
};
export default ErrorAlert;
