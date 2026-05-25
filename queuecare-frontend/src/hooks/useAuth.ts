import { useContext } from 'react';
import { AuthContext, AuthContextType } from '@context/AuthContext';

/**
 * Custom hook to use Auth Context
 * Provides all authentication functionality and state
 *
 * @returns {AuthContextType} Auth context with user, token, and methods
 *
 * @example
 * const { user, login, logout, isAuthenticated } = useAuth();
 *
 * if (!isAuthenticated) {
 *   return <Navigate to="/login" />;
 * }
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default useAuth;
