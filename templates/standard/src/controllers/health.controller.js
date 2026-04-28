export const getHealthStatus = (req, res) => {
	res.status(200).json({
		status: 'success',
		message: 'API is running optimally.',
		timestamp: new Date().toISOString()
	});
};
