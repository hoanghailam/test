const express = require('express');
const router = express.Router();
const User = require('../models/user-model');
const Activity = require('../models/activity-model');
const ActivityManager = require('../common/helpers/activityHelper');

const WheelTypes = require("../common/constants/WheelTypes");

const allWheelConfig = require("../config/activity/wheel/config.json");
const allWheelRewardsConfig = require("../config/activity/wheel/rewards.json");
const allWheelShopConfig = require("../config/activity/wheel/shop.json");

// ----------------------
// Helper: select reward by weight
// ----------------------
function selectByWeight(items) {
    if (!items || items.length === 0) return null;
    const totalWeight = items.reduce((acc, val) => acc + (val.weight || 0), 0);
    if (totalWeight === 0) return null;

    const randomNumber = Math.random() * totalWeight;
    let cumulativeWeight = 0;

    for (const item of items) {
        cumulativeWeight += item.weight || 0;
        if (randomNumber <= cumulativeWeight) return item;
    }
    return null;
}

// ----------------------
// Status endpoints
// ----------------------
router.get('/api/v1/lucky/turntable/gold/status', async (req, res) => {
    const userId = req.headers.userid;
    let activity = await Activity.findOne({ userId });
    if (!activity) activity = await ActivityManager.createActivitySession(userId);

    res.json({ code: 1, message: "SUCCESS", data: { isFree: activity.freeWheel == null ? 1 : 0 } });
});

router.get('/api/v1/lucky/turntable/diamond/status', async (req, res) => {
    const userId = req.headers.userid;
    let activity = await Activity.findOne({ userId });
    if (!activity) activity = await ActivityManager.createActivitySession(userId);

    res.json({ code: 1, message: "SUCCESS", data: { isFree: activity.freeWheelDiamond == null ? 1 : 0 } });
});

// ----------------------
// Lucky turntable info
// ----------------------
router.get('/api/v1/lucky/turntable', async (req, res) => {
    const userId = req.headers.userid;
    const type = req.query.type;
    const user = await User.findOne({ userId });
    let activity = await Activity.findOne({ userId });
    if (!activity) activity = await ActivityManager.createActivitySession(userId);

    if (![WheelTypes.GOLD, WheelTypes.DIAMOND].includes(type)) {
        return res.status(400).json({ code: 3, message: "Invalid Parameter", data: null });
    }

    const activityInfo = { ...allWheelConfig[type] };
    activityInfo.rewardInfoList = allWheelRewardsConfig[type][`rewardInfoList_${user.sex}`] || [];
    activityInfo.isFree = type === WheelTypes.GOLD ? activity.freeWheel : activity.freeWheelDiamond;

    res.json({ code: 1, message: "SUCCESS", data: activityInfo });
});

// ----------------------
// Spin lucky turntable
// ----------------------
router.post('/api/v1/lucky/turntable', async (req, res) => {
    const userId = req.headers.userid;
    const type = req.query.type;
    const isMulti = req.query.isMulti === "1";
    const user = await User.findOne({ userId });
    let activity = await Activity.findOne({ userId });
    if (!activity) activity = await ActivityManager.createActivitySession(userId);

    if (![WheelTypes.GOLD, WheelTypes.DIAMOND].includes(type)) {
        return res.status(400).json({ code: 3, message: "Invalid Parameter", data: null });
    }

    const rewardsPool = allWheelRewardsConfig[type][`rewardInfoList_${user.sex}`] || [];
    const spins = isMulti ? 10 : 1;
    const rewards = [];

    for (let i = 0; i < spins; i++) {
        const reward = selectByWeight(rewardsPool);
        if (!reward) continue;

        rewards.push({
            id: reward.id || 0,
            name: reward.name || "Unknown",
            icon: reward.icon || "",
            amount: reward.amount || 0,
            type: reward.type || "item"
        });
    }

    res.json({ code: 1, message: "SUCCESS", data: { spinCount: spins, rewards } });
});

// ----------------------
// Block reward info
// ----------------------
router.get('/api/v1/lucky/turntable/block/reward', async (req, res) => {
    const userId = req.headers.userid;
    const type = req.query.type;
    const user = await User.findOne({ userId });
    let activity = await Activity.findOne({ userId });
    if (!activity) activity = await ActivityManager.createActivitySession(userId);

    if (![WheelTypes.GOLD, WheelTypes.DIAMOND].includes(type)) {
        return res.status(400).json({ code: 3, message: "Invalid Parameter", data: null });
    }

    const shopData = allWheelShopConfig[type][`shop_${user.sex}`] || [];
    const blockWealth = type === WheelTypes.GOLD
        ? parseInt(activity.luckGold) || 0
        : parseInt(activity.luckDiamonds) || 0;

    res.json({
        code: 1,
        message: "SUCCESS",
        data: {
            userBlock: blockWealth,
            remainingTime: allWheelConfig.remainingTime,
            blockShopRewardInfoList: shopData
        }
    });
});

module.exports = router;