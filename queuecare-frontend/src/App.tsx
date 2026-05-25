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

  return <AppRoutes />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router future={routerFutureFlags}>
        <AuthProvider>
          <WebSocketProvider>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </WebSocketProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
