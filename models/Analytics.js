const mongoose = require('mongoose');

const { Schema } = mongoose;

const AnalyticsSchema = new Schema({
    shortId: { type: String, unique: true, index: true },
    clickCount: { type: Number, default: 0 },
    lastAccessed: { type: Date, default: null }
}, { versionKey: false });

module.exports = mongoose.model('Analytics', AnalyticsSchema);