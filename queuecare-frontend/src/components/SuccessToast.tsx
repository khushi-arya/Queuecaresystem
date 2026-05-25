import React, { useEffect, useState } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface SuccessToastProps {
  /**
   * Toast message
   */
  message: string;

  /**
   * Show toast
   * @default false
   */
  open?: boolean;

  /**
   * Duration in milliseconds
   * @default 4000
   */
  duration?: number;

  /**
   * Toast severity/type
   * @default "success"
   */
  severity?: AlertColor;

  /**
   * Position of toast
   * @default "bottom"
   */
  vertical?: 'top' | 'bottom';

  /**
   * Horizontal position
   * @default "right"
   */
  horizontal?: 'left' | 'center' | 'right';

  /**
   * Callback when toast closes
   */
  onClose?: () => void;
}

/**
 * SuccessToast Component
 * Displays a temporary notification toast message
 *
 * @example
 * // Basic success toast
 * <SuccessToast message="Operation successful!" open={true} />
 *
 * @example
 * // With custom duration
 * <SuccessToast
 *   message="Saved successfully"
 *   open={true}
 *   duration={3000}
 * />
 *
 * @example
 * // Warning toast with close callback
 * <SuccessToast
 *   message="Warning: This action cannot be undone"
 *   severity="warning"
 *   open={true}
 *   onClose={() => setToastOpen(false)}
 * />
 */
export const SuccessToast: React.FC<SuccessToastProps> = ({
  message,
  open = false,
  duration = 4000,
  severity = 'success',
  vertical = 'bottom',
  horizontal = 'right',
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical, horizontal }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{
          width: '100%',
          minWidth: '300px',
          boxShadow: (theme) =>
            theme.palette.mode === 'light'
              ? '0 4px 12px rgba(0, 0, 0, 0.15)'
              : '0 4px 12px rgba(0, 0, 0, 0.45)',
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SuccessToast;
