const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const router = express.Router();
const fs = require('fs');
const bcrypt = require('bcryptjs');

const User = require('../models/user-model');
const Account = require('../models/account-model');
const Vip = require('../models/vip-model');
const locale = require('../common/helpers/localeHelper');
const UserManager = require('../common/helpers/userHelper');
const Locale = require('../models/locale-model');
const { languages } = require('../config/language.json');

router.post('/api/v1/user/details/info', async (req, res) => {
    const userId = req.headers['userid'];

    if (!userId) {
        return res.status(400).json({ code: 6, message: 'Bad request : Params error please fill them', data: null });
    }

    const user = await User.findOne({ userId });
    const vip = await Vip.findOne({ userId });

    let formattedExpireDate = null;
    if (vip?.expireDate) {
        const date = new Date(vip.expireDate);
        const pad = n => n.toString().padStart(2, '0');
        formattedExpireDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
    }

    const userInfo = await UserManager.getUserInfo(userId);

    res.status(200).json({ code: 1, message: 'SUCCESS', data: userInfo });
});

router.post('api/v1/user/details/info', async (req, res) => {
    const userId = req.headers.userid;
    const { oldName, newName } = req.query;
    
    if (!userId || !oldName || !newName) {
        return res.status(400).json({ code: 6, message: 'Bad request : Params error please fill them', data: null });
    }
    
        let user = await User.findOne({ userId: uid });

    if (!user) {
        return res.status(200).json({
            code: 102,
            message: 'User ID or username not found.',
            data: null
        });
    }

    if (user.nickname !== oldName) {
        return res.status(200).json({
            code: 108,
            message: 'Incorrect nicknames.',
            data: null
        });
    }
});

router.post('/api/v1/user/password/modify', async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.headers['userid']; 

    if (!newPassword || newPassword.trim() === '') {
        return res.status(400).json({ 
            code: 1, 
            message: 'New password cannot be empty', 
            data: null 
        });
    }
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ 
                code: 1, 
                message: 'User not found', 
                data: null 
            });
        }
        const saltRounds = await bcrypt.genSalt(8); // you can tweak this higher for better security
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(200).json({
                code: 108, 
                message: 'Incorrect old password', 
                data: null
            });
        }
        user.password = hashedPassword;
        await user.save();

       
        return res.status(200).json({ 
            code: 1, 
            message: 'SUCCESS', 
            data: {
                userId: user.userId,
                nickName: user.nickname,
                diamonds: user.diamonds,
                gold: user.gold,
                picUrl: user.picUrl || '',
                vip: user.vip
            } 
        });
});

router.post('/api/v1/emails/password/reset', async (req ,res) => {
    const email = req.query.email;
    const emails = await User.findOne({ email });
    
    if (!emails) {
            return res.status(404).json({ 
                code: 1, 
                message: 'Email not found', 
                data: null 
            });
    }
    
    res.status(200).json({ 
            code: 1, 
            message: 'SUCCESS', 
            data: {
                userId: user.userId,
                nickName: user.nickname,
                diamonds: user.diamonds,
                gold: user.gold,
                picUrl: user.picUrl || '',
                vip: user.vip
            } 
        });
});

router.put('/api/v1/user/info', async (req, res) => {
    const birthday = req.body.birthday;
    const details = req.body.details;
 if (!details) {
    const userId = req.headers.userid;
    
    const user = await User.findOne({ userId });
    
    if (!user) {
            return res.status(404).json({ 
                code: 1, 
                message: 'User not found', 
                data: null 
            });
    }
    
    user.birthday = birthday;
    await user.save();
    
    const userInfo = {
        userId: user.userId,
        sex: user.sex || 2,
        nickName: user.nickname,
        birthday: user.birthday || '',
        details: user.introduction,
        diamonds: user.diamonds,
        golds: user.gold, 
        vip: user.vip,
        picUrl: user.picUrl || '',
        isFreeNickname: user.isFreeNickname || true,
        hasPassword: true,
        stopToTime: null
    };

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: userInfo });
 }
 
    const userId = req.headers.userid;
    
    const user = await User.findOne({ userId });
    
    if (!user) {
            return res.status(404).json({ 
                code: 1, 
                message: 'User not found', 
                data: null 
            });
    }
    
    user.introduction = details;
    await user.save();
    
    const userInfo = {
        userId: user.userId,
        sex: user.sex || 2,
        nickName: user.nickname,
        birthday: user.birthday || '',
        details: user.introduction,
        diamonds: user.diamonds,
        golds: user.gold, 
        vip: user.vip,
        picUrl: user.picUrl || '',
        isFreeNickname: user.isFreeNickname || true,
        hasPassword: true,
        stopToTime: null
    };

    res.status(200).json({ code: 1, message: 'SUCCESS', data: userInfo });
});

router.get('/api/v1/user/nickName/free', async (req, res) => {
    const userId = req.headers.userid;
    const user = await User.findOne({ userId });

    const response = {
        currencyType: 1,
        quantity: 50,
        free: user.isFreeNickname
    }
    
    res.status(200).json({ code: 1, message: 'SUCCESS', data: response });
});

router.get('/api/v1/app/auth-token', async (req, res) => {
    const userId = req.headers.userid;
    res.status(200).json({ code: 1, message: 'SUCCESS', data: userId });
});

router.put('/api/v1/user/nickName', async (req, res) => {
    const userId = req.headers.userid;
    const user = await User.findOne({ userId });
    const newNickname = req.query.newName;
    if (!newNickname) {
        return res.status(200).json({
                code: 3,
                message: "Invalid parameter",
                data: null
        });
    }

    const isNicknameExists = await User.findOne({ nickname: newNickname });
    if (isNicknameExists) {
        return res.status(200).json({
                code: 1003,
                message: "Nickname is already in use",
                data: null
        });
    }
    
    if (user.nickname == newNickname) {
        return res.status(200).json({
                code: 3,
                message: "Invalid parameter",
                data: null
        });
    }

    let result = 0;
    if (user.isFreeNickname) {
        user.isFreeNickname = false;
        await user.save();
    } else {
        if (user.diamonds < 50) {
            result = 1;
        } else {
            user.diamonds = (user.diamonds - 50);
            await user.save();
        }
    }

    if (result == 1) {
        return res.status(200).json({ code: 5006, message: 'Not enough diamonds or gold', data: null });
    }

    user.nickname = newNickname;
    await user.save();

    const userInfo = {
        userId: user.userId,
        sex: user.sex || 2,
        nickName: user.nickname,
        birthday: user.birthday || '',
        details: user.introduction,
        diamonds: user.diamonds,
        golds: user.gold, 
        vip: user.vip,
        picUrl: user.picUrl || '',
        hasPassword: true,
        stopToTime: null
    };

    res.status(200).json({ code: 1, message: 'SUCCESS', data: userInfo });
});

router.post('/api/v1/user/language', async (req, res) => {
    const userId = req.headers.userid;
    const languageName = req.query.language;

    if (!languageName) {
        return res.status(200).json({ code: 6, message: "Invalid parameter", data: null });
     }

    const localeData = await locale.setUserLanguage(userId, languageName);
    res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
});

router.get('/api/v1/users/:userId/daily/tasks/ads/config', async (req, res) => {
    res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
});

router.get('/api/v1/user/details/info', async (req, res) => {
    const userId = req.headers.userid;
    const user = await User.findOne({ userId });
    const account = await Account.findOne({ userId });
    const userInfo = {
        userId: user.userId,
        sex: user.sex || 2,
        nickName: user.nickname,
        birthday: user.birthday || '',
        details: user.introduction,
        diamonds: user.diamonds,
        golds: user.gold, 
        email: account.email,
        vip: user.vip,
        picUrl: user.picUrl || '',
        hasPassword: true,
        stopToTime: null
    };
    res.status(200).json({ code: 1, message: 'SUCCESS', data: userInfo });
});

router.get('/api/v1/user/player/info', async (req, res) => {
    const userId = req.headers.userid;
    const vip = await Vip.findOne({ userId });

    let formattedDate = null;
    if (vip?.expireDate) {
        const date = new Date(vip.expireDate);
        const pad = n => n.toString().padStart(2, '0');
        formattedDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
    }

    return res.status(200).json({
        code: 1,
        message: 'SUCCESS',
        data: {
            vip: vip,
            expireDate: formattedDate
        }
    });
});

module.exports = router;