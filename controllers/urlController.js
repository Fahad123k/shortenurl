

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
        /**
         * this below URL convert like this
         * {protocol: "https:",
         * hostname: "www.facebook.com",
         * pathname: "/somepage"
         * 
         */
        const u = new URL(ref);
        return u.hostname.replace(/^www\./, '');
    } catch (e) { return null; }
}

exports.shortenUrl = async (req, res) => {
    const longUrl = req.body.url;
    if (!longUrl) return res.status(400).json({ error: 'url is required' }); //status 400 bad request

    try {
        //Uses Node.js built-in URL class to check if longUrl is a valid URL.
        new URL(longUrl);
    } catch (e) {
        return res.status(400).json({ error: 'invalid url' });
    }

    try {
        //Generates a Snowflake ID → guaranteed unique number (snow).
        const snow = idGen.nextId();
        //Converts that large number into a Base62 string (short, URL-safe) → shortId.
        const shortId = encodeBase62(snow);


        /**
         * 
         * Creates a new document in MongoDB using the myUrl model.
         * Stores:hortId (Base62 code)
         * longUrl (original link)
         * nowflakeId (unique identifier for scaling/tracking)
         */
        const urlDoc = new myUrl({ shortId, longUrl, snowflakeId: snow });
        await urlDoc.save();

        /**
        Initializes an analytics record for this short link.
        Stores:shortId (to track which URL this belongs to)
        clickCount: 0 (starts with zero clicks). 
        */
        await Analytics.create({ shortId, clickCount: 0 });
        const shortUrl = `${BASE_HOST}/api/${shortId}`;

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
            const urlDoc = await myUrl.findOne({ shortId }).lean();//Don’t give me a full Mongoose Document. Just give me a plain JavaScript
            if (!urlDoc) return res.status(404).send('Not found');
            longUrl = urlDoc.longUrl;
            if (redis) await redis.set(`url:${shortId}`, longUrl, 'EX', 60 * 60);
        }

        const ip = req.ip || req.connection.remoteAddress || null; //ip: visitor’s IP address (for geo, abuse detection, etc.).
        const ref = req.get('referer') || req.get('referrer') || null;  //ref: the referer header (where the click came from — e.g., https:/ / facebook.com)
        const domain = domainFromReferrer(ref); //custom helper to extract just the domain (e.g., "facebook.com")

        const clickDoc = new Click({ shortId, referrer: domain, ip });
        const p1 = clickDoc.save(); //Doesn’t wait yet, just prepares promise p1.


        //  wait promise p2
        const p2 = Analytics.updateOne(
            { shortId },
            { $inc: { clickCount: 1 }, $set: { lastAccessed: new Date() } },
            { upsert: true } //upsert: true → create if it doesn’t exist yet.
        );


        const p3 = domain ?
            Referrer.updateOne(
                { shortId, domain },
                { $inc: { count: 1 } },
                { upsert: true }
            )
            : Promise.resolve();

        // await Promise.all([p1, p2, p3]); 

        return res.redirect(302, longUrl); //Finally, send a 302 redirect (temporary redirect) to the longUrl.
    } catch (err) {
        console.error('redirect error', err);
        return res.status(500).send('Internal server error');
    }
};


