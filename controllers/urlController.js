

const myUrl = require('../models/myUrl');
const Click = require('../models/Click');
const Referrer = require('../models/Referrer');
const Analytics = require('../models/Analytics');

const idGen = require('../utils/idGenerator');
const encodeBase62 = require('../utils/base62');
const redis = require('../config/redis');

const BASE_HOST = process.env.BASE_HOST || 'http://localhost:3000';

// Helper: extract domain from referrer header
function domainFromReferrer(ref) {
    try {
        if (!ref) return null;
        const u = new URL(ref);
        return u.hostname.replace(/^www\./, '');
    } catch (e) { return null; }
}

exports.shortenUrl = async (req, res) => {
    const longUrl = req.body.url;
    if (!longUrl) return res.status(400).json({ error: 'url is required' });

    try {
        new URL(longUrl);
    } catch (e) {
        return res.status(400).json({ error: 'invalid url' });
    }

    try {
        const snow = idGen.nextId();
        const shortId = encodeBase62(snow);

        const urlDoc = new myUrl({ shortId, longUrl, snowflakeId: snow });
        await urlDoc.save();

        await Analytics.create({ shortId, clickCount: 0 });

        const shortUrl = `${BASE_HOST}/${shortId}`;
        return res.json({ shortUrl, shortId });
    } catch (err) {
        console.error('Error creating short url', err);
        return res.status(500).json({ error: 'internal server error' });
    }
};

exports.redirectUrl = async (req, res) => {
    const shortId = req.params.shortId;
    if (!shortId) return res.status(400).send('Bad request');

    try {
        let longUrl = null;
        if (redis) {
            const cached = await redis.get(`url:${shortId}`);
            if (cached) longUrl = cached;
        }

        if (!longUrl) {
            const urlDoc = await myUrl.findOne({ shortId }).lean();
            if (!urlDoc) return res.status(404).send('Not found');
            longUrl = urlDoc.longUrl;
            if (redis) await redis.set(`url:${shortId}`, longUrl, 'EX', 60 * 60);
        }

        const ip = req.ip || req.connection.remoteAddress || null;
        const ref = req.get('referer') || req.get('referrer') || null;
        const domain = domainFromReferrer(ref);

        const clickDoc = new Click({ shortId, referrer: domain, ip });
        const p1 = clickDoc.save();

        const p2 = Analytics.updateOne(
            { shortId },
            { $inc: { clickCount: 1 }, $set: { lastAccessed: new Date() } },
            { upsert: true }
        );

        const p3 = domain ?
            Referrer.updateOne(
                { shortId, domain },
                { $inc: { count: 1 } },
                { upsert: true }
            ) :
            Promise.resolve();

        await Promise.all([p1, p2, p3]);

        return res.redirect(302, longUrl);
    } catch (err) {
        console.error('redirect error', err);
        return res.status(500).send('Internal server error');
    }
};


