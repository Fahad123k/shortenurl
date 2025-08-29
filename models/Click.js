const mongoose = require('mongoose');

const { Schema } = mongoose;

const ClickSchema = new Schema({
    shortId: { type: String, index: true },
    timestamp: { type: Date, default: Date.now },
    referrer: { type: String, default: null },
    ip: { type: String, default: null }
}, { versionKey: false });

module.exports = mongoose.model('Clicks', ClickSchema);