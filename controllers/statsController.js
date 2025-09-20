const Analytics = require('../models/Analytics');
const Referrer = require('../models/Referrer');
const Click = require('../models/Click');

exports.getStats = async (req, res) => {
    const shortId = req.params.shortId;
    if (!shortId) return res.status(400).json({ error: 'shortId required' });

    try {
        const analytics = await Analytics.findOne({ shortId }).lean();
        if (!analytics) return res.status(404).json({ error: 'not found' });

        const top = await Referrer.find({ shortId }).sort({ count: -1 }).limit(5).lean();
        const topReferrers = top.map(r => ({ domain: r.domain, count: r.count }));

        const recent = await Click.find({ shortId })
            .sort({ timestamp: -1 })
            .limit(20)
            .select('timestamp ip -_id')
            .lean();


        const recentClicks = {};
        recent.forEach((r, index) => {
            recentClicks[`Click ${index + 1}`] = {
                timestamp: r.timestamp,
                ip: r.ip || "Unknown"
            };
        });
        ;


        // Unique visitors (based on IP)
        const uniqueIps = await Click.distinct('ip', { shortId });
        const uniqueVisitors = uniqueIps.length;

        return res.json({
            shortId,
            clickCount: analytics.clickCount || 0,
            lastAccessed: analytics.lastAccessed,
            topReferrers,
            recentClicks,
            uniqueVisitors
        });
    } catch (err) {
        console.error('stats error', err);
        return res.status(500).json({ error: 'internal server error' });
    }
};

exports.healthCheck = (req, res) => {
    res.json({ status: 'ok' });
};