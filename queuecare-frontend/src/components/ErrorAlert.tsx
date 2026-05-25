import React from 'react';
import { Alert, AlertTitle, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ErrorAlertProps {
  /**
   * Error message or array of messages
   */
  message: string | string[];

  /**
   * Error title
   * @default "Error"
   */
  title?: string;

  /**
   * Show close button
   * @default true
   */
  closeable?: boolean;

  /**
   * Callback when close button is clicked
   */
  onClose?: () => void;

  /**
   * Alert severity level
   * @default "error"
   */
  severity?: 'error' | 'warning' | 'info';

  /**
   * Custom sx styles
   */
  sx?: any;
}

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
export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  title = 'Error',
  closeable = true,
  onClose,
  severity = 'error',
  sx,
}) => {
  const messages = Array.isArray(message) ? message : [message];

  return (
    <Alert
      severity={severity}
      sx={{
        mb: 2,
        ...sx,
      }}
      action={
        closeable && onClose ? (
          <IconButton
            size="small"
            color="inherit"
            onClick={onClose}
            sx={{ ml: 1 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        ) : undefined
      }
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      <Box>
        {messages.length === 1 ? (
          <span>{messages[0]}</span>
        ) : (
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            {messages.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        )}
      </Box>
    </Alert>
  );
};

export default ErrorAlert;
