export function sendSuccessResponse(res, data = null, message = 'Success') {
  return res.json({ success: true, message, data });
}

export function sendErrorResponse(res, error, status = 500) {
  const message = typeof error === 'string' ? error : (error && error.message) || 'An error occurred';
  return res.status(status).json({ success: false, message });
}

export default { sendSuccessResponse, sendErrorResponse };
