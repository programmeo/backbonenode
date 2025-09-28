import { verifyAccessToken } from '../utils/jwt.js';
import { CONSTANTS } from '../config/constants.js';
import { ROLES } from '../config/roles.js';
import { createError } from '../utils/errorHandler.js';
import User from '../models/user.js';

export const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw createError('No token provided', 401);
        }

        const token = authHeader.split(' ')[1];

        // Verify token using helper
        const decoded = verifyAccessToken(token);

        // Find user
        const user = await User.findById(decoded.userId).select('-password -refreshToken');
        if (!user) {
            throw createError('User not found', 401);
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(createError('Invalid token', 401));
        }
        if (error.name === 'TokenExpiredError') {
            return next(createError('Token expired', 401));
        }
        next(error);
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(createError('Unauthorized', 401));
        }

        // Normalize roles: allow passing ROLES.ADMIN or 'admin'
        const normalized = roles.map(r => (typeof r === 'string' ? r : r));
        if (!normalized.includes(req.user.role)) {
            return next(createError('Not authorized to access this route', 403));
        }

        next();
    };
};