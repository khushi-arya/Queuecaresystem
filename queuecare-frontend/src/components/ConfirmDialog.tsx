import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';

interface ConfirmDialogProps {
  /**
   * Dialog title
   */
  title: string;

  /**
   * Dialog message or description
   */
  message: string;

  /**
   * Show dialog
   * @default false
   */
  open: boolean;

  /**
   * Dialog type/severity
   * @default "warning"
   */
  type?: 'warning' | 'info' | 'error' | 'success';

  /**
   * Primary action button text
   * @default "Confirm"
   */
  confirmText?: string;

  /**
   * Cancel button text
   * @default "Cancel"
   */
  cancelText?: string;

  /**
   * Disable confirm button
   * @default false
   */
  confirmDisabled?: boolean;

  /**
   * Show loading state on confirm button
   * @default false
   */
  confirmLoading?: boolean;

  /**
   * Callback when confirmed
   */
  onConfirm: () => void;

  /**
   * Callback when cancelled
   */
  onCancel: () => void;
}

/**
 * ConfirmDialog Component
 * Modal dialog for confirming user actions (delete, cancel, etc.)
 *
 * @example
 * // Delete confirmation
 * <ConfirmDialog
 *   title="Delete Appointment"
 *   message="Are you sure you want to delete this appointment? This cannot be undone."
 *   open={showDialog}
 *   type="warning"
 *   confirmText="Delete"
 *   onConfirm={() => handleDelete()}
 *   onCancel={() => setShowDialog(false)}
 * />
 *
 * @example
 * // Info confirmation
 * <ConfirmDialog
 *   title="Confirm Action"
 *   message="Are you sure you want to proceed?"
 *   open={showDialog}
 *   type="info"
 *   onConfirm={() => handleAction()}
 *   onCancel={() => setShowDialog(false)}
 * />
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  open,
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmDisabled = false,
  confirmLoading = false,
  onConfirm,
  onCancel,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <WarningIcon sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />;
      case 'error':
        return <WarningIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />;
      case 'info':
        return <InfoIcon sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />;
      default:
        return <HelpIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />;
    }
  };

  const getConfirmColor = (): 'inherit' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
    switch (type) {
      case 'warning':
      case 'error':
        return 'error';
      default:
        return 'primary';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          {getIcon()}
        </Box>
        <Typography variant="h6" align="center" sx={{ mt: 1 }}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          fullWidth
          sx={{ order: 1 }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={getConfirmColor()}
          disabled={confirmDisabled || confirmLoading}
          fullWidth
          sx={{ order: 2 }}
        >
          {confirmLoading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
