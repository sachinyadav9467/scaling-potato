export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(422).json({
      error: {
        code: 'DUPLICATE_RESOURCE',
        message: 'Resource already exists',
        details: { field: err.meta?.target?.[0] }
      }
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found'
      }
    });
  }

  // Validation errors
  if (err.name === 'ValidationError' || err.errors) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: { fields: err.errors || err.message }
      }
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        code: 'AUTH_INVALID',
        message: 'Invalid authentication token'
      }
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'SERVER_ERROR',
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    }
  });
};
