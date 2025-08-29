const mongoose = require('mongoose');

const { Schema } = mongoose;

const ReferrerSchema = new Schema({
    shortId: { type: String, index: true },
    domain: { type: String },
    count: { type: Number, default: 0 }
}, { versionKey: false });

ReferrerSchema.index({ shortId: 1, domain: 1 }, { unique: true });

module.exports = mongoose.model('Referrer', ReferrerSchema);