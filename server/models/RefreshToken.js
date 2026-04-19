import mongoose from 'mongoose';
import crypto from 'crypto';

const refreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isValid: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash token before saving
refreshTokenSchema.pre('save', function (next) {
    if (!this.isModified('token')) {
        return next();
    }

    // Hash the token for storage
    this.token = crypto.createHash('sha256').update(this.token).digest('hex');
    next();
});

// Static method to verify and find token
refreshTokenSchema.statics.findValidToken = async function (token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    return await this.findOne({
        token: hashedToken,
        isValid: true,
        expiresAt: { $gt: new Date() }
    });
};

// Static method to invalidate token
refreshTokenSchema.statics.invalidateToken = async function (token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    return await this.updateOne(
        { token: hashedToken },
        { isValid: false }
    );
};

// Index for automatic cleanup of expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;
