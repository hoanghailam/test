const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const router = express.Router();

const User = require('../models/user-model');
const Account = require('../models/account-model');
const MailBindTypes = require('../constants/MailBindTypes.js');
const Mailer = require('../../server/Mailer.js');

const emailCodes = new Map();
const emailReqs = new Map();

router.post('/api/v1/email/send', async (req, res) => {
    const userId = req.headers['userid'];
    const bindType = parseInt(req.query.bindType);
    if (bindType != MailBindTypes.BIND && bindType != MailBindTypes.UNBIND) {
        res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
        return;
    }
    
    const email = req.body.email;
    if (bindType == MailBindTypes.BIND && !email) {
        res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
        return;
    }

    const candidate = await Account.findOne({ email });
    if (candidate && bindType == MailBindTypes.BIND) {
        return res.status(200).json({
            code: 113,
            message: "This email was already bound to an account",
            data: null
        });
    }

    const code = Math.floor(100000 + Math.random() * 900000);
    emailCodes.set(`request_${userId}`, `${code}`);
    
    switch (bindType) {
        case MailBindTypes.BIND:
            emailReqs.set(`email_request_${userId}`, `${email}`);
            break;
        case MailBindTypes.UNBIND:
            // Soon :)
            break;
    }
    
    setTimeout(() => {
      emailCodes.delete(`request_${userId}`);
      emailReqs.delete(`email_request_${userId}`);
    }, 5 * 60 * 1000); // 5 minutes

    const mailResult = await Mailer.send("Blockveil", "blockveil.smtp@gmail.com", "angelojudeserranothe2nd@gmail.com", `Blockveil Email Binding ${code}`, `Your code is <b>${code}</b>.`);
    
      if (mailResult.success) {
        return res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
      } else if (mailResult.quotaExceeded) {
        return res.status(200).json({
            code: 4,
            message: "INNER ERROR",
            data: null
        });
      } else {
        return res.status(200).json({
            code: 4,
            message: "INNER ERROR",
            data: null
        });
      }
});

router.post('/api/v1/email/bind', async (req, res) => {
    const userId = req.headers['userid'];
    const verifyCode = parseInt(req.query.verifyCode);
    if (!verifyCode) {
        res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
        return;
    }

    const email = emailReqs.get(`email_request_${userId}`);
    if (!email) {
        return res.status(200).json({
            code: 107,
            message: "The provided code is invalid or no request has been made to bind an email",
            data: null
        });
    }

    const code = emailCodes.get(`request_${userId}`);
    if (code != verifyCode) {
        return res.status(200).json({
            code: 107,
            message: "The provided code is invalid or no request has been made to bind an email",
            data: null
        });
    }

    const account = await Account.findOne({ userId });
    account.email = email;
    await account.save();

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: email });
});

router.delete('/api/v1/email/bind', async (req, res) => {
    const userId = req.headers['userid'];
    const verifyCode = parseInt(req.query.verifyCode);
    if (!verifyCode) {
        res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
        return;
    }

    const code = emailCodes.get(`request_${userId}`);
    if (code != verifyCode) {
        return res.status(200).json({
            code: 107,
            message: "The provided code is invalid or no request has been made to bind an email",
            data: null
        });
    }

    const account = await Account.findOne({ userId });
    account.email = '';
    await account.save();

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
});

module.exports = router;