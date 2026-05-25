import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box } from '@mui/material';
import QueueStatus from '@components/Patient/QueueStatus';
/**
 * PatientLayout Component
 * Wraps patient pages with additional components like QueueStatus
 * Provides consistent layout for all patient-facing pages
 *
 * @example
 * <PatientLayout>
 *   <PatientDashboard />
 * </PatientLayout>
 */
export const PatientLayout = ({ children }) => {
    return (_jsxs(Box, { children: [_jsx(Box, { sx: { maxWidth: 'lg', mx: 'auto', px: 2, pt: 2 }, children: _jsx(QueueStatus, {}) }), children] }));
};
export default PatientLayout;
