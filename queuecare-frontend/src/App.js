import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router } from 'react-router-dom';
import theme from '@theme';
import AppRoutes, { routerFutureFlags } from './routes/AppRoutes';
import { AuthProvider } from '@context/AuthContext';
import { NotificationProvider } from '@context/NotificationContext';
import { WebSocketProvider } from '@context/WebSocketContext';
import { useNotificationSubscription } from '@hooks/useNotificationSubscription';
/**
 * AppContent component to ensure hooks are used within provider context
 */
function AppContent() {
    // Initialize WebSocket notification subscription for real-time updates
    useNotificationSubscription();
    return _jsx(AppRoutes, {});
}
function App() {
    return (_jsxs(ThemeProvider, { theme: theme, children: [_jsx(CssBaseline, {}), _jsx(Router, { future: routerFutureFlags, children: _jsx(AuthProvider, { children: _jsx(WebSocketProvider, { children: _jsx(NotificationProvider, { children: _jsx(AppContent, {}) }) }) }) })] }));
}
export default App;
