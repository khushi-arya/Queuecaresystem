import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ConstructionIcon from '@mui/icons-material/Construction';
export const ComingSoon = ({ featureName }) => {
    const navigate = useNavigate();
    return (_jsx(Container, { maxWidth: "md", children: _jsxs(Box, { sx: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 10,
                textAlign: 'center',
            }, children: [_jsx(ConstructionIcon, { sx: { fontSize: 100, color: 'primary.main', mb: 4, opacity: 0.8 } }), _jsx(Typography, { variant: "h3", component: "h1", gutterBottom: true, sx: { fontWeight: 700 }, children: featureName }), _jsx(Typography, { variant: "h5", color: "text.secondary", paragraph: true, sx: { mb: 4 }, children: "We're working hard to bring you this feature. Stay tuned!" }), _jsx(Box, { sx: { mt: 2 }, children: _jsx(Button, { variant: "contained", size: "large", onClick: () => navigate('/dashboard'), sx: { borderRadius: 2, px: 4 }, children: "Back to Dashboard" }) })] }) }));
};
export default ComingSoon;
