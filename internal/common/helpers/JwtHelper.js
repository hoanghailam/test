const jwt = require('jsonwebtoken');

const JWT_SECRET = 'BMVeil2025pNwbUvhs';

const jwtSign = async (userId, secret = JWT_SECRET) => {
    try {
        const token = jwt.sign({ userId }, secret);
        return token;
    } catch (error) {
        throw new Error('Error signing token');
    }
};

const jwtVerify = async (req, res, next) => {
    const userId = req.headers.userid;
    const accessToken = req.headers['access-token'];

    if (!userId || !accessToken) {
        return res.status(401).json({ code: 3, message: 'Access-Token and UserId are required' });
    }

    const account = await Account.findOne({ userId });

    if (!account) {
        return res.status(404).json({ code: 102, message: 'Account not found', data: null });
    }

    if (account.accessToken !== accessToken) {
        return res.status(403).json({ code: 403, message: 'Access-Token does not match', data: null });
    }

    next();
};

module.exports = {
    jwtSign,
    jwtVerify
};