import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import { validateFile, createFileObject } from '../../utils/helpers/fileUtils';

/**
 * Reusable File Upload Component
 * @param {Object} props - Component props
 * @param {string} props.label - Label for the file upload
 * @param {string} props.note - Additional note/description
 * @param {Function} props.onFileUpload - Callback function when file is uploaded
 * @param {Object} props.uploadedFile - Currently uploaded file object
 * @param {Function} props.onFileRemove - Callback function when file is removed
 * @param {string} props.accept - Accepted file types
 * @param {boolean} props.required - Whether the field is required
 */
const FileUpload = ({
  label,
  note,
  onFileUpload,
  uploadedFile,
  onFileRemove,
  accept = '.pdf,.jpg,.jpeg,.png',
  required = false,
}) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validation = validateFile(file);
      
      if (validation.isValid) {
        const fileObject = createFileObject(file);
        onFileUpload(fileObject);
      } else {
        alert(validation.error);
      }
    }
  };

  const handleFileRemove = () => {
    if (onFileRemove) {
      onFileRemove();
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'application/pdf') {
      return <PictureAsPdfIcon sx={{ color: '#75A5A3', mr: 1 }} />;
    }
    return <ImageIcon sx={{ color: '#75A5A3', mr: 1 }} />;
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ mb: 1 }}>
        {label}
        {required && <span style={{ color: 'red' }}>*</span>}
        {note && (
          <Typography 
            component="span" 
            sx={{ 
              display: 'block',
              fontSize: '0.875rem',
              color: 'text.secondary'
            }}
          >
            {note}
          </Typography>
        )}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
        Upload 1 supported file. Max 10 MB.
      </Typography>
      
      {!uploadedFile ? (
        <Button
          component="label"
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          sx={{ 
            color: '#75A5A3',
            borderColor: '#75A5A3',
            '&:hover': {
              borderColor: '#75A5A3'
            }
          }}
        >
          ADD File
          <input 
            type="file" 
            hidden 
            accept={accept}
            onChange={handleFileChange}
          />
        </Button>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          p: 2,
          border: '1px solid #75A5A3',
          borderRadius: 1,
          bgcolor: 'rgba(117, 165, 163, 0.1)'
        }}>
          {getFileIcon(uploadedFile.type)}
          <Typography 
            sx={{ 
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {uploadedFile.name}
          </Typography>
          <CheckCircleIcon sx={{ color: '#4CAF50', ml: 1 }} />
          <Button
            size="small"
            sx={{ ml: 1 }}
            onClick={handleFileRemove}
          >
            Change
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;
