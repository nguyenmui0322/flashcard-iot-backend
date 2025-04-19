/**
 * Error handling middleware
 */

export const errorHandler = (err, req, res, next) => {
  console.error('Error caught by middleware:', err);
  
  // Handle Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds the 5MB limit',
      });
    }
    
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }
  
  // Handle other errors
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
}; 