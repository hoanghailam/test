const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const router = express.Router();
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user-model');
const Account = require('../models/account-model');
const ClanMember = require('../models/clanMember-model');

const { jwtSign, jwtVerify } = require('../common/helpers/JwtHelper');
const serverConfiguration = require('../server-configuration');

const VipManager = require('../common/helpers/vipHelper');
const ActivityManager = require('../common/helpers/activityHelper');
const WealthManager = require('../common/helpers/wealthHelper');

const policyConfig = require('../config/policies');

router.post('/api/v1/app/set-password', async (req, res) => {
    const { password } = req.body;
    const userId = req.headers.userid;

    if (!userId) {
        return res.status(400).json({ code: 6, message: 'Bad request : Params error please fill them', data: null });
    }

    let user = await Account.findOne({ userId });

    if (!user) {
        return res.status(404).json({ code: 108, message: 'User not found', data: null });
    }

    const saltRounds = await bcrypt.genSalt(8);
    
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
    
});

router.post('/api/v1/app/renew', async (req, res) => {
    const accountCount = await Account.countDocuments();
    const baseUserId = 16;
    const userId = (baseUserId + accountCount * 16).toString();
    
    if (policyConfig.disableAccountCreation) {
        return Responses.policyDenyRequest();
    }
    
    const accessToken = await jwtSign(userId);

    const newAccount = new Account({
        userId,
        accessToken,
        creationTime: new Date(),
        lastSeen: new Date(),
        email: ''
    });
    
    await newAccount.save();

    res.status(200).json({ code: 1, message: 'SUCCESS', data: { userId, accessToken: accessToken } });
});

router.post('/api/v1/user/register', async (req, res) => {
    const { nickName, sex } = req.body;
    const userId = req.headers.userid;

    if (!nickName || !sex) {
        return res.status(400).json({ code: 6, message: 'Bad request: Params error, please fill them', data: null });
    }
    
    if (nickName.length > serverConfiguration.user.userNicknameMax) {
        return res.status(200).json({
            code: 60001,
            message: 'nickName cannot surpass the limit',
            data: null
        });
    }

    if (nickName.length < serverConfiguration.user.userNicknameMin) {
        return res.status(200).json({
            code: 60002,
            message: 'nickName cannot be below the limit',
            data: null
        });
    }

    const account = await Account.findOne({ userId });
    if (account && !account.password) {
        return res.status(200).json({
            code: 106,
            message: 'The profile does not have a password set',
            data: null
        });
    }

    const existingUser = await User.findOne({ nickname: nickName });
    if (existingUser) {
        return res.status(400).json({
            code: 7,
            message: 'Nickname already exists, choose another nickname',
            data: null
        });
    }
    
    const profileExist = await User.findOne({ userId });
    if (profileExist) {
        return res.status(200).json({
            code: 110,
            message: 'The profile is already registered',
            data: null
        });
    }

    const user = new User({
        userId,
        nickname: nickName,
        sex,
        picUrl: '',
        birthday: '',
        introduction: '',
        isFreeNickname: true,
        status: 0,
        stopToTime: null,
        stopReason: null
    });

    await user.save();
    
    await VipManager.createVipSession(userId);
    await ActivityManager.createActivitySession(userId);
    await WealthManager.createWealthSession(userId);
    
    const clanMember = new ClanMember({
       userId: user.userId,
       clanId: 0,
       clanRole: 0,
       experience: 0,
       currentDiamond: 0,
       currentGold: 0,
       lastDonationDate: null
    });

    await clanMember.save();

    const responseData = { 
        userId: user.userId,
        nickName: nickName,
        sex: user.sex, 
        picUrl: user.picUrl, 
        introduction: user.introduction,
        birthday: user.birthday,
        hasPassword: true
    };
    
    res.status(200).json({ 
        code: 1, 
        message: 'SUCCESS', 
        data: responseData 
    });
});

router.post('/api/v1/app/login', async (req, res) => {
    const { uid, password } = req.body;

    if (!uid || !password) {
        return res.status(400).json({ code: 6, message: 'Bad request: Params error, please fill them', data: null });
    }
    
    let account = await Account.findOne({ userId: uid });

    const isMatch = await bcrypt.compare(password, account.password);

    if (!account) {
        return res.status(200).json({
            code: 102,
            message: 'User ID or username not found.',
            data: null
        });
    }

    if (!isMatch) {
        return res.status(200).json({
            code: 108,
            message: 'Incorrect password.',
            data: null
        });
    }
    
    const accessToken = await jwtSign(account.userId);
    
    account.accessToken = accessToken
    await account.save();

    res.status(200).json({
        code: 1,
        data: {
            userId: account.userId,
            accessToken: accessToken,
            telephone: '',
            email: account.email
        },
        message: 'SUCCESS'
    });
});

module.exports = router;