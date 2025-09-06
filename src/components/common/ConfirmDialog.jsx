import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography,
  Box 
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';

/**
 * Reusable Confirmation Dialog Component
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether dialog is open
 * @param {Function} props.onClose - Function to close dialog
 * @param {Function} props.onConfirm - Function to call on confirmation
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Dialog message
 * @param {string} props.type - Dialog type (warning, info, error)
 * @param {string} props.confirmText - Confirm button text
 * @param {string} props.cancelText - Cancel button text
 * @param {boolean} props.confirmDisabled - Whether confirm button is disabled
 */
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmDisabled = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <ErrorIcon sx={{ color: '#E53935', fontSize: 48 }} />;
      case 'info':
        return <InfoIcon sx={{ color: '#2196F3', fontSize: 48 }} />;
      case 'warning':
      default:
        return <WarningIcon sx={{ color: '#FF9800', fontSize: 48 }} />;
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'error':
        return '#E53935';
      case 'info':
        return '#2196F3';
      case 'warning':
      default:
        return '#FF9800';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {getIcon()}
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', px: 3, py: 2 }}>
        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
          {message}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', gap: 2, p: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            minWidth: 100,
            color: 'text.secondary',
            borderColor: 'grey.300',
            '&:hover': {
              borderColor: 'grey.400',
              bgcolor: 'grey.50',
            }
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={confirmDisabled}
          sx={{
            minWidth: 100,
            bgcolor: getConfirmButtonColor(),
            '&:hover': {
              bgcolor: getConfirmButtonColor(),
              filter: 'brightness(0.9)',
            },
            '&:disabled': {
              bgcolor: 'grey.300',
              color: 'grey.500',
            }
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
