import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password by default in queries
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    refreshToken: {
        type: String,
        default: null,
        select: false // Don't include refresh token by default
    },
    passwordResetToken: {
        type: String,
        default: null,
        select: false
    },
    passwordResetExpires: {
        type: Date,
        default: null,
        select: false
    },
    // OTP / Magic link support
    otpCode: {
        type: String,
        default: null,
        select: false
    },
    otpExpires: {
        type: Date,
        default: null,
        select: false
    },
    magicLinkToken: {
        type: String,
        default: null,
        select: false
    },
    magicLinkExpires: {
        type: Date,
        default: null,
        select: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Instead of removing sensitive fields in toJSON, we use select: false
// This way, we can explicitly include them when needed using .select('+password')
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    return {
        _id: obj._id,
        name: obj.name,
        email: obj.email,
        role: obj.role,
        isActive: obj.isActive,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt
    };
};

// Add method to get sensitive data when needed
userSchema.methods.getAuthData = function() {
    return {
        _id: this._id,
        email: this.email,
        role: this.role,
        refreshToken: this.refreshToken
    };
};

export default mongoose.model('User', userSchema);