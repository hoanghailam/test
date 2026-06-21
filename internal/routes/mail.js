const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const router = express.Router();
const fs = require('fs');

const MailManager = require('../common/helpers/mailHelper');

router.get('/api/v1/mail', async (req, res) => {
    const userId = req.headers['userid'];
    const mailbox = (await MailManager.getMail(userId))
        .sort((a, b) => {
        
            if (a.getStatus() !== b.getStatus()) {
                return a.getStatus() - b.getStatus();
            }
        
            return b.getCreationTime() - a.getCreationTime();
        })
        .map(x => x.response());
        
    res.status(200).json({ code: 1, message: 'SUCCESS', data: mailbox });
});

router.put('/api/v1/mail', async (req, res) => {
    const userId = req.headers['userid'];
    const { ids } = req.query;
    
    const status = parseInt(req.query.status) || 0;

    if (!status || !ids) {
        return res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
    }
    
    if (status < MailStatuses.READ || status > MailStatuses.DELETE) {
        return res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
    }
    
    if (status === 0) {
        return res.status(200).json({ code: 1, message: 'Status cannot be 0', data: null });
    }

    ids = Array.isArray(ids) ? ids : [ids];

    const mailbox = await Mail.find({ id: { $in: ids }, userId: userId });

    if (mailbox.length === 0) {
        return res.status(200).json({ code: 1, message: 'Mail not found', data: null });
    }

    for (let i = 0; i < mailbox.length; i++) {
        const mail = mailbox[i];

        if (status === MailStatuses.DELETE) {
            if (mail.status === MailStatuses.READ) {
                await Mail.deleteMany({ id: mail.id, userId: userId });
            }
            continue;
        }
        
        if (status === MailStatuses.READ && mail.attachment !== null) {
           continue;
        }

        if (status < mail.status) {
           continue;
        } else {
            mail.status = status;
            await mail.save();
        }
    }
    
    res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
});

router.get('/api/v1/mail/new', async (req, res) => {
    const userId = req.headers['userid'];
    const newMail = await MailManager.isNewMail(userId);
    res.status(200).json({ code: 1, message: 'SUCCESS', data: newMail });
});

module.exports = router;