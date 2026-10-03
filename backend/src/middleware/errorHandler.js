function errorHandler(err, req, res, next) {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof SyntaxError && err.status === 400 && Object.prototype.hasOwnProperty.call(err, 'body')) {
    return res.status(400).json({
      success: false,
      message: 'Request body contains malformed JSON.'
    });
  }

  const status = err.status || 500;
  const message = err.publicMessage || (status === 500 ? 'Something went wrong on the server.' : err.message);

  res.status(status).json({
    success: false,
    message
  });
}

function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: 'Route not found.'
  });
}

function createHttpError(status, publicMessage) {
  const error = new Error(publicMessage);
  error.status = status;
  error.publicMessage = publicMessage;
  return error;
}

module.exports = {
  errorHandler,
  notFound,
  createHttpError
};
