const mongoose = require('mongoose');

const { Schema } = mongoose;

const UrlSchema = new Schema({
    shortId: { type: String, unique: true, index: true },
    longUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    snowflakeId: { type: String, unique: true, index: true }
}, { versionKey: false });

module.exports = mongoose.model('Url', UrlSchema);