const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    serialNo: {
        type: String,
        required: [true, 'Serial number is required'],
        unique: true,
        trim: true
    },
    filename: {
        type: String,
        required: true
    },
    pdfUrl: {
        type: String,
        required: true
    },
    qrCodeUrl: {
        type: String,
        required: true
    },
    // Form Data
    formData: {
        MARINE_AFFAIRS_NO: String,
        MARINE_AFFAIRS_NO_FA: String,
        SERIAL_NO: String,
        SERIAL_NO_FA: String,
        ISSUE_DATE_TIME: String,
        ISSUE_DATE_TIME_FA: String,
        PORT_CLEARANCE_NO: String,
        PORT_CLEARANCE_NO_FA: String,
        CUSTOM_LEAVE_NO: String,
        CUSTOM_LEAVE_NO_FA: String,
        AGENT: String,
        AGENT_FA: String,
        VESSEL_NAME: String,
        VESSEL_NAME_FA: String,
        ARRIVED_FROM: String,
        ARRIVED_FROM_FA: String,
        ON_DATE: String,
        ON_DATE_FA: String,
        IMO_NO: String,
        IMO_NO_FA: String,
        SHIPS_FLAG: String,
        SHIPS_FLAG_FA: String,
        REGISTRY_PORT: String,
        REGISTRY_PORT_FA: String,
        GROSS_TONNAGE: String,
        GROSS_TONNAGE_FA: String,
        MASTER: String,
        MASTER_FA: String,
        PERMITTED_TO_SAIL: String,
        PERMITTED_TO_SAIL_FA: String,
        HEAD_OF_MARITIME: String,
        HEAD_OF_MARITIME_FA: String,
        PORT: String,
        PORT_FA: String,
        isSigned: Boolean
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'deleted'],
        default: 'active'
    },
    expiresAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
documentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Check if document is expired
documentSchema.methods.isExpired = function() {
    if (!this.expiresAt) return false;
    return this.expiresAt < new Date();
};

// Auto-update status if expired
documentSchema.pre('find', function() {
    this.where({ $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] });
});

module.exports = mongoose.model('Document', documentSchema);

