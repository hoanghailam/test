const Account = require('../internal/models/account-model');
const requirementsConfig = require('../internal/config/requirements.json');
const crypto = require('crypto');

let bypassPaths = new Set();
let bypassPrefixes = [];

function loadRequirementsConfig() {
    if (bypassPaths.size === 0 && bypassPrefixes.length === 0) {
        if (Array.isArray(requirementsConfig.bypassAuthCheck)) {
            requirementsConfig.bypassAuthCheck.forEach(p => bypassPaths.add(p));
        }

        if (Array.isArray(requirementsConfig.bypassPrefix)) {
            bypassPrefixes = requirementsConfig.bypassPrefix;
        }
    }
}

function isBypassPath(reqPath) {
    return bypassPaths.has(reqPath) || bypassPrefixes.some(prefix => reqPath.startsWith(prefix));
}

// Generate a secure random token
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

async function requireAuth(req, res, next) {
    loadRequirementsConfig();

    if (isBypassPath(req.path)) {
        return next();
    }

    const userId = req.headers.userid;
    const accessToken = req.headers['access-token'];

    if (!userId || !accessToken) {
        return res.status(400).json({ code: 400, message: 'UserId and Access-Token are required in headers', data: null });
    }

    const account = await Account.findOne({ userId });

    if (!account) {
        return res.status(404).json({ code: 102, message: 'Account not found', data: null });
    }

    // Update last seen
    account.lastSeen = new Date();

    // Optional: Auto-generate token if missing
    if (!account.accessToken) {
        account.accessToken = generateToken();
        console.log(`Generated new token for user ${userId}: ${account.accessToken}`);
    }

    await account.save();

    if (account.accessToken !== accessToken) {
        return res.status(401).json({ code: 401, message: 'Access-Token does not match', data: null });
    }

    next();
}

module.exports = requireAuth;