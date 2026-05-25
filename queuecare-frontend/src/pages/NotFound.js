import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
/**
 * NotFound Component (404 Page)
 * Displays when user navigates to non-existent route
 */
export const NotFound = () => {
    const navigate = useNavigate();
    return (_jsx(Box, { sx: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            bgcolor: '#f5f5f5',
        }, children: _jsx(Container, { maxWidth: "sm", children: _jsxs(Box, { sx: {
                    textAlign: 'center',
                    py: 8,
                }, children: [_jsx(ErrorOutlineIcon, { sx: {
                            fontSize: 80,
                            color: 'error.main',
                            mb: 3,
                        }, "aria-label": "Error icon" }), _jsx(Typography, { variant: "h2", component: "h1", sx: {
                            fontWeight: 'bold',
                            mb: 1,
                            fontSize: { xs: '3rem', md: '4rem' },
                        }, children: "404" }), _jsx(Typography, { variant: "h5", component: "h2", sx: {
                            color: 'text.secondary',
                            mb: 2,
                            fontWeight: 500,
                        }, children: "Page Not Found" }), _jsx(Typography, { variant: "body1", sx: {
                            color: 'text.secondary',
                            mb: 4,
                            lineHeight: 1.6,
                        }, children: "We couldn't find the page you're looking for. It might have been moved or deleted. Let's get you back on track." }), _jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 2, justifyContent: "center", children: [_jsx(Button, { variant: "contained", color: "primary", size: "large", onClick: () => navigate(-1), "aria-label": "Go back to previous page", children: "Go Back" }), _jsx(Button, { variant: "outlined", color: "primary", size: "large", onClick: () => navigate('/dashboard'), "aria-label": "Go to dashboard", children: "Dashboard" }), _jsx(Button, { variant: "outlined", color: "primary", size: "large", onClick: () => navigate('/login'), "aria-label": "Go to login page", children: "Login" })] }), _jsx(Typography, { variant: "caption", sx: {
                            display: 'block',
                            mt: 6,
                            color: 'text.disabled',
                        }, children: "If you believe this is an error, please contact support." })] }) }) }));
};
export default NotFound;
