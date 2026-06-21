const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const router = express.Router();
const fs = require('fs');
const aa = require('../config/firstrecharge');
const ab = require('../config/recharge');

const User = require('../models/user-model');
const Transaction = require('../models/transaction-model');
const Wealth = require('../models/wealth-model');

router.get('/api/v1/pay/payssion/flag', async (req, res) => {
    return res.status(200).json({
        code: 1,
        message: "SUCCESS",
        data: true
    });
});

router.get('/api/v1/wealth/user', async (req, res) => {
    const userId = req.headers.userid;
    const user = await Wealth.findOne({ userId });
    if (!user) {
      return res.status(200).json({ code: 0, message: 'Wealth data has not been added', data: null });
    };
    
    return res.status(200).json({
        code: 1,
        message: "SUCCESS",
        data: {
            userId: userId,
            golds: user.gold,
            diamonds: user.diamonds,
            clanGolds: user.clanGold
        }
    });
});

router.get('/api/v1/pay/products', async (req, res) => {
    const userId = req.headers.userid;
    let user = await User.findOne({ userId });
    return res.status(200).json({
        code: 1,
        message: "SUCCESS",
        data: ab
    });
});

router.get('/api/v1/pay/products/vip', async (req, res) => {
    const userId = req.headers.userid;
    let user = await User.findOne({ userId });
    return res.status(200).json({
        code: 1,
        message: "SUCCESS",
        data: []
    });
});

router.get('/api/v1/first/punch/reward', async (req, res) => {
    const userId = req.headers.userid;
    let user = await User.findOne({ userId });
    return res.status(200).json({
        code: 1,
        message: "SUCCESS",
        data: aa
    });
});

function convertToUnixTimestamp(mongoDate) {
    if (mongoDate instanceof Date) {
        return Math.floor(mongoDate.getTime() / 1000);
    }
    throw new Error("Provided value is not a valid MongoDB Date object.");
}

// Function to convert MongoDB Date to Unix Timestamp
function convertToUnixTimestamp(mongoDate) {
    if (mongoDate instanceof Date) {
        return Math.floor(mongoDate.getTime() / 1000);
    }
    throw new Error("Provided value is not a valid MongoDB Date object.");
}

// Example: Mapping Transactions with Unix Time
router.get('/api/v1/wealth/record/users/:userId', async (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const userId = req.headers.userid;
    const transactions = await Transaction.find({ userId });

    if (pageNo !== 0) {
        return res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: {
                pageNo,
                pageSize,
                totalPage: 0,
                totalSize: 0,
                data: []
            }
        });
    }

    // Map the transactions and convert 'created' to Unix timestamp
    const mappedTransactions = transactions.map(transaction => ({
        ...transaction.toObject(),
        created: convertToUnixTimestamp(transaction.created)
    }));

    return res.status(200).json({
        code: 1,
        message: 'SUCCESS',
        data: {
            pageNo,
            pageSize,
            totalPage: 0,
            totalSize: mappedTransactions.length,
            data: mappedTransactions,
            other: null
        }
    });
});

module.exports = router;