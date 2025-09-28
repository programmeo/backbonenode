export function createError(message, status = 500) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export function errorMiddleware(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  res.status(status).json({ success: false, message: err.message || 'Server Error' });
}

export default { createError, errorMiddleware };
