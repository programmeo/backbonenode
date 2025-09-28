import { CONSTANTS } from '../config/constants.js';
import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { generateOtp, generateMagicLinkToken, isOtpExpired } from '../utils/otp.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
import User from '../models/user.js';
import { createError } from '../utils/errorHandler.js';

class AuthController {
    register = async (req, res) => {
        try {
            const { email, password, name } = req.body;
            const existing = await User.findOne({ email });
            if (existing) throw createError('User already exists', 400);

            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);

            const user = await User.create({ email, password: hashed, name });

            const accessToken = signAccessToken({ userId: user._id });
            const refreshToken = signRefreshToken({ userId: user._id });

            user.refreshToken = refreshToken;
            await user.save();

            sendSuccessResponse(res, { user: user.toJSON(), accessToken, refreshToken }, 'User registered');
        } catch (err) {
            sendErrorResponse(res, err.message);
        }
    };

    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email }).select('+password +refreshToken');
            if (!user) throw createError('Invalid credentials', 401);

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) throw createError('Invalid credentials', 401);

            const accessToken = signAccessToken({ userId: user._id });
            const refreshToken = signRefreshToken({ userId: user._id });

            user.refreshToken = refreshToken;
            await user.save();

            sendSuccessResponse(res, { user: user.toJSON(), accessToken, refreshToken }, 'Login successful');
        } catch (err) {
            sendErrorResponse(res, err.message);
        }
    };

    logout = async (req, res) => {
        try {
            const user = req.user;
            user.refreshToken = null;
            await user.save();
            sendSuccessResponse(res, null, 'Logout successful');
        } catch (err) {
            sendErrorResponse(res, err.message);
        }
    };

    refreshToken = async (req, res) => {
        try {
            const { refreshToken } = req.body;
            const decoded = verifyRefreshToken(refreshToken);
            const user = await User.findById(decoded.userId).select('+refreshToken');
            if (!user || user.refreshToken !== refreshToken) throw createError('Invalid refresh token', 401);

            const accessToken = signAccessToken({ userId: user._id });
            const newRefresh = signRefreshToken({ userId: user._id });
            user.refreshToken = newRefresh;
            await user.save();

            sendSuccessResponse(res, { accessToken, refreshToken: newRefresh }, 'Token refreshed');
        } catch (err) {
            sendErrorResponse(res, err.message);
        }
    };

    forgotPassword = async (req, res) => {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });
            if (!user) return sendSuccessResponse(res, null, 'If the email exists, reset will be sent');

            const resetToken = signRefreshToken({ userId: user._id });
            user.passwordResetToken = resetToken;
            user.passwordResetExpires = Date.now() + (60 * 60 * 1000);
            await user.save();

            // TODO: send email
            sendSuccessResponse(res, null, 'Password reset initiated');
        } catch (err) {
            sendErrorResponse(res, err.message);
        }
    };

    resetPassword = async (req, res) => {
        try {
            const { token, newPassword } = req.body;
            const decoded = verifyRefreshToken(token);
            const user = await User.findOne({ _id: decoded.userId, passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } });
            if (!user) throw createError('Invalid or expired token', 400);

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            user.passwordResetToken = null;
            user.passwordResetExpires = null;
            user.refreshToken = null;
            await user.save();

            sendSuccessResponse(res, null, 'Password reset successful');
        } catch (err) {
            sendErrorResponse(res, err.message);
        }
    };

    // Request OTP for email (magic code)
    requestOtp = async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) throw createError('Email is required', 400);

            let user = await User.findOne({ email });
            if (!user) {
                // Create a user record with minimal info so OTP can be tied to account
                user = await User.create({ email, name: email.split('@')[0], password: Math.random().toString(36) });
            }

            const otp = generateOtp();
            user.otpCode = otp;
            user.otpExpires = Date.now() + parseInt(CONSTANTS.OTP_EXPIRY, 10);
            await user.save();

            // TODO: send OTP via email/SMS. For now return it in response for dev.
            sendSuccessResponse(res, { otp }, 'OTP generated');
        } catch (err) {
            sendErrorResponse(res, err.message);
        }
    };

    verifyOtp = async (req, res) => {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) throw createError('Email and OTP are required', 400);

            const user = await User.findOne({ email }).select('+otpCode +otpExpires');
            if (!user) throw createError('Invalid OTP or email', 401);

            if (user.otpCode !== otp || isOtpExpired(user.otpExpires)) {
                throw createError('Invalid or expired OTP', 401);
            }

            // Clear OTP and issue tokens
            user.otpCode = null;
            user.otpExpires = null;
            const accessToken = signAccessToken({ userId: user._id });
            const refreshToken = signRefreshToken({ userId: user._id });
            user.refreshToken = refreshToken;
            await user.save();

            sendSuccessResponse(res, { user: user.toJSON(), accessToken, refreshToken }, 'OTP verified');
        } catch (err) {
            sendErrorResponse(res, err.message);
        }
    };

    // Send magic link (creates a token stored on user and a link to verify)
    sendMagicLink = async (req, res) => {
        try {
            const { email, redirectUrl } = req.body;
            if (!email || !redirectUrl) throw createError('Email and redirectUrl required', 400);

            let user = await User.findOne({ email });
            if (!user) {
                user = await User.create({ email, name: email.split('@')[0], password: Math.random().toString(36) });
            }

            const token = generateMagicLinkToken();
            user.magicLinkToken = token;
            user.magicLinkExpires = Date.now() + parseInt(CONSTANTS.MAGIC_LINK_EXPIRY, 10) || (15 * 60 * 1000);
            await user.save();

            // In a real app you'd email a link like `${redirectUrl}?token=${token}` to the user.
            // For dev we return the link in response.
            const magicUrl = `${redirectUrl.replace(/\/$/, '')}?token=${token}&email=${encodeURIComponent(email)}`;
            sendSuccessResponse(res, { magicUrl }, 'Magic link generated');
        } catch (err) {
            sendErrorResponse(res, err.message);
        }
    };

    // Verify magic link token
    magicCallback = async (req, res) => {
        try {
            const { token, email } = req.query;
            if (!token || !email) throw createError('Invalid magic link', 400);

            const user = await User.findOne({ email }).select('+magicLinkToken +magicLinkExpires');
            if (!user || user.magicLinkToken !== token || isOtpExpired(user.magicLinkExpires)) {
                throw createError('Invalid or expired magic link', 401);
            }

            // Clear token and issue tokens
            user.magicLinkToken = null;
            user.magicLinkExpires = null;
            const accessToken = signAccessToken({ userId: user._id });
            const refreshToken = signRefreshToken({ userId: user._id });
            user.refreshToken = refreshToken;
            await user.save();

            // Redirect to a front-end callback with tokens (not implemented here)
            sendSuccessResponse(res, { accessToken, refreshToken }, 'Magic link validated');
        } catch (err) {
            sendErrorResponse(res, err.message);
        }
    };
}

export default new AuthController();