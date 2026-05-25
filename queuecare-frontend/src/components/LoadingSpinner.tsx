import React from 'react';
import { Box, CircularProgress, Backdrop, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  /**
   * Show fullscreen backdrop
   * @default true
   */
  fullscreen?: boolean;

  /**
   * Custom message to display
   */
  message?: string;

  /**
   * Spinner size in pixels
   * @default 40
   */
  size?: number;

  /**
   * Show backdrop behind spinner
   * @default true
   */
  backdrop?: boolean;

  /**
   * Backdrop opacity
   * @default 0.5
   */
  backdropOpacity?: number;
}

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
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullscreen = true,
  message,
  size = 40,
  backdrop = true,
  backdropOpacity = 0.5,
}) => {
  const spinnerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullscreen && backdrop) {
    return (
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})`,
        }}
        open={true}
      >
        {spinnerContent}
      </Backdrop>
    );
  }

  if (fullscreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        {spinnerContent}
      </Box>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
