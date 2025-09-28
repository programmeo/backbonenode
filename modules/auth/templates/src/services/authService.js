import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CONSTANTS } from '../config/constants.js';
import { createError } from '../utils/errorHandler.js';
import User from '../models/user.js';

class AuthService {
    #generateTokens(userId) {
        const accessToken = jwt.sign(
            { userId },
            CONSTANTS.JWT_SECRET,
            { expiresIn: CONSTANTS.JWT_ACCESS_EXPIRY }
        );

        const refreshToken = jwt.sign(
            { userId },
            CONSTANTS.JWT_REFRESH_SECRET,
            { expiresIn: CONSTANTS.JWT_REFRESH_EXPIRY }
        );

        return { accessToken, refreshToken };
    }

    async #hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    async #verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    async registerUser({ email, password, name }) {
        try {
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw createError('User already exists', 400);
            }

            // Hash password and create user
            const hashedPassword = await this.#hashPassword(password);
            const user = await User.create({
                email,
                password: hashedPassword,
                name
            });

            // Generate tokens
            const tokens = this.#generateTokens(user._id);

            // Save refresh token to user (ensure field selected when needed)
            user.refreshToken = tokens.refreshToken;
            await user.save();

            return {
                user: {
                    _id: user._id,
                    email: user.email,
                    name: user.name
                },
                ...tokens
            };
        } catch (error) {
            throw createError(error.message, error.status || 500);
        }
    }

    async loginUser({ email, password }) {
        try {
            // Find user and verify password
            const user = await User.findOne({ email });
            if (!user) {
                throw createError('Invalid credentials', 401);
            }

            const isValidPassword = await this.#verifyPassword(password, user.password);
            if (!isValidPassword) {
                throw createError('Invalid credentials', 401);
            }

            // Generate new tokens
            const tokens = this.#generateTokens(user._id);

            // Update refresh token
            user.refreshToken = tokens.refreshToken;
            await user.save();

            return {
                user: {
                    _id: user._id,
                    email: user.email,
                    name: user.name
                },
                ...tokens
            };
        } catch (error) {
            throw createError(error.message, error.status || 500);
        }
    }

    async logoutUser(user) {
        try {
            // Clear refresh token
            user.refreshToken = null;
            await user.save();
            return true;
        } catch (error) {
            throw createError(error.message, error.status || 500);
        }
    }

    async refreshUserToken(refreshToken) {
        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, CONSTANTS.JWT_REFRESH_SECRET);
            
            // Find user and check refresh token
            const user = await User.findById(decoded.userId);
            if (!user || user.refreshToken !== refreshToken) {
                throw createError('Invalid refresh token', 401);
            }

            // Generate new tokens
            const tokens = this.#generateTokens(user._id);

            // Update refresh token
            user.refreshToken = tokens.refreshToken;
            await user.save();

            return tokens;
        } catch (error) {
            throw createError('Invalid refresh token', 401);
        }
    }

    async initiatePasswordReset(email) {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                // Return success even if user doesn't exist for security
                return true;
            }

            const resetToken = jwt.sign(
                { userId: user._id },
                CONSTANTS.PASSWORD_RESET_SECRET,
                { expiresIn: CONSTANTS.PASSWORD_RESET_EXPIRY }
            );

            user.passwordResetToken = resetToken;
            // PASSWORD_RESET_EXPIRY may be a duration like '1h' — store expiry timestamp conservatively
            const expirySeconds = typeof CONSTANTS.PASSWORD_RESET_EXPIRY === 'string' ? 3600 : (CONSTANTS.PASSWORD_RESET_EXPIRY || 3600);
            user.passwordResetExpires = Date.now() + expirySeconds * 1000;
            await user.save();

            // TODO: Send reset email with token
            // This will be implemented in the notification module

            return true;
        } catch (error) {
            throw createError(error.message, error.status || 500);
        }
    }

    async resetPassword(resetToken, newPassword) {
        try {
            // Verify reset token
            const decoded = jwt.verify(resetToken, CONSTANTS.PASSWORD_RESET_SECRET);
            
            // Find user and check reset token
            const user = await User.findOne({
                _id: decoded.userId,
                passwordResetToken: resetToken,
                passwordResetExpires: { $gt: Date.now() }
            });

            if (!user) {
                throw createError('Invalid or expired reset token', 400);
            }

            // Update password and clear reset token
            user.password = await this.#hashPassword(newPassword);
            user.passwordResetToken = null;
            user.passwordResetExpires = null;
            user.refreshToken = null; // Logout from all devices
            await user.save();

            return true;
        } catch (error) {
            throw createError('Invalid or expired reset token', 400);
        }
    }
}

export default AuthService;