const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const router = express.Router();
const fs = require('fs');

const serverConfiguration = require('../server-configuration');
const languages = require('../common/language');

const User = require('../models/user-model');
const Account = require('../models/account-model');
const locale = require('../common/helpers/localeHelper');
const Friend = require('../models/friend-model');
const FriendRequest = require('../models/friendRequest-model');
const Vip = require('../models/vip-model');
const ClanMember = require('../models/clanMember-model');
const Clan = require('../models/clan-model');

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

router.get('/api/v1/friends/info/:nickName', async (req, res) => {
  try {
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const nickName = req.params.nickName || '';
    const userId = req.headers.userid;

    if (!nickName) {
      return res.status(200).json({
        code: 1,
        message: 'SUCCESS',
        data: {
          pageNo: 1,
          pageSize: 10,
          totalSize: 0,
          totalPage: 0,
          data: []
        }
      });
    }

    // Get friendIds to exclude
    const friendList = await Friend.find({ friendFor: userId })
      .limit(pageSize)
      .skip(pageSize * pageNo)
      .lean();

    const friendIds = friendList.map(f => Number(f.friendId));

    const startIndex = pageNo * pageSize;

    const safeNickName = escapeRegex(nickName);

    const filter = {
      nickname: { $regex: safeNickName, $options: 'i' },
      userId: { $ne: userId, $nin: friendIds }
    };

    const rowNew = await User.find(filter)
      .skip(startIndex)
      .limit(pageSize)
      .lean();

    const totalSize = await User.countDocuments(filter);
    const totalPage = Math.ceil(totalSize / pageSize);
    
    const formattedUsers = await Promise.all(rowNew.map(async (user) => {
      const langCode = await locale.getUserLocale(user.userId, 'language');
      const languageName = languages[langCode];
      return {
        userId: user.userId,
        nickName: user.nickname,
        picUrl: user.picUrl,
        country: languageName
      };
    }));

    return res.status(200).json({
      code: 1,
      message: 'SUCCESS',
      data: {
        totalSize,
        totalPage,
        pageNo,
        pageSize,
        data: formattedUsers
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ code: 0, message: 'Server error' });
  }
});

router.get('/api/v1/friends/info/id/:friendId', async (req, res) => {
    const userId = req.headers.userid;
    const friendId = req.params.friendId;
    
    if (userId == friendId) {
        return res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: null
        });
    }

    const friends = await Friend.find({ friendFor: userId });
    const hasFriend = friends.some(friend => friend.userId === friendId);
    if (hasFriend) {
        return res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: null
        });
    }
    
    const users = await User.find({});
    const isFriendExists = users.some(user => user.userId === friendId);
    if (!isFriendExists) {
        return res.status(200).json({
            code: 102,
            message: "The user doesn't exist",
            data: null
        });
    }
    
    const user = await User.findOne({ userId: friendId });
    const vip = await Vip.findOne({ userId: friendId });
    if (!user) {
        return res.status(200).json({ code: 3004, message: 'The searched user does not exist', data: null });
    }

    const clanMembers = await ClanMember.findOne({ userId: friendId });
    const friendEntry = await Friend.findOne({ userId: friendId, friendFor: userId });

    const responseData = {
        userId: user.userId || '',
        nickName: user.nickname || '',
        picUrl: user.picUrl || '',
        alias: friendEntry ? friendEntry.alias : '',
        status: 30,
        vip: vip.vip || 0,
        expireDate: null,
        sex: user.sex || 2,
        details: user.introduction || '',
        birthday: "",
        friend: !!friendEntry
    };

    if (clanMembers?.clanId && clanMembers.clanId !== 0) {
        const clan = await Clan.findOne({ clanId: clanMembers.clanId });
        responseData.clanId = clan?.clanId || 0;
        responseData.clanName = clan?.name || null;
        responseData.role = clanMembers.clanRole || 0;
    }
        
    return res.status(200).json({
        code: 1,
        message: "SUCCESS",
        data: responseData
    });
});

router.get('/api/v1/friends/status', async (req, res) => {
    const userId = req.headers.userid;
    const friendList = await Friend.find({ friendFor: userId });

    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    
    // Get all users seen within last 2 minutes
    const onlineUsers = await Account.find({ lastSeen: { $gte: twoMinutesAgo } }).select('userId');
    const onlineUserIds = new Set(onlineUsers.map(u => u.userId));

    const status = await Promise.all(friendList.map(async (friend) => {
        const friendUser = await User.findOne({ userId: friend.userId }).select('userId nickname');

        return {
            userId: friendUser.userId,
            status: onlineUserIds.has(friendUser.userId) ? 10 : 30, // 10 = online, 30 = offline
            gameId: 'g1008',
            gameName: 'Bedwars'
        };
    }));

    const response = {
        maxFriendCount: 500,
        curFriendCount: status.length,
        status,
        currentTime: Date.now()
    };
    
    res.status(200).json({ code: 1, message: 'SUCCESS', data: response });
});

router.get('/api/v1/friends', async (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const userId = req.headers.userid;
    const friendList = await Friend.find({ friendFor: userId })
        .limit(parseInt(pageSize))
        .skip(parseInt(pageSize) * parseInt(pageNo));

    const pageThing = await Friend.countDocuments({ friendFor: userId });

    const data = await Promise.all(friendList.map(async (friend) => {
        const friendUser = await User.findOne({ userId: friend.userId });
        const vip = await Vip.findOne({ userId: friend.userId });

        if (!friendUser) {
            return null;
        }

        return {
            userId: userId || '0',
            nickName: friendUser.nickname,
            picUrl: friendUser.picUrl,
            vip: vip.vip,
            friendId: friendUser.userId || '0',
            alias: friendUser.alias || ''
        };
    }));

    const filteredData = data.filter(item => item !== null);

    const response = {
        pageNo: parseInt(pageNo),
        pageSize: 999999,
        totalPage: pageThing,
        totalSize: 0,
        data: filteredData
    };

        res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: response
    });
});

router.post('/api/v1/friends', async (req, res) => {
    const userId = req.headers.userid;
    const { friendId, msg } = req.body;

    if (!friendId) {
        return res.status(400).json({ code: 6, message: 'Missing required parameters', data: null });
    }

    if (msg.length > serverConfiguration.friend.friendRequestMsgMax) {
        return res.status(400).json({
            code: 60005,
            message: 'Exceed max request message limit',
            data: null
        });
    }

    if (userId === friendId) {
        return res.status(200).json({ code: 6, message: "You cannot add yourself", data: null });
    }

    const friendUser = await User.findOne({ userId: friendId });
    if (!friendUser) {
        return res.status(200).json({ code: 3004, message: 'Friend does not exist', data: null });
    }

    const isAlreadyFriend = await Friend.exists({ userId, friendFor: friendId });
    if (isAlreadyFriend) {
        return res.status(200).json({ code: 3001, message: 'Already friends', data: null });
    }

    const userFriendCount = await Friend.countDocuments({ friendFor: userId });
    const friendFriendCount = await Friend.countDocuments({ friendFor: friendId });

    if (userFriendCount >= 500 || friendFriendCount >= 500) {
        return res.status(200).json({ code: 3002, message: 'Max friend limit reached', data: null });
    }
    
    const existingRequest = await FriendRequest.findOne({ userId, forId: friendId, status: 0 });
    if (existingRequest && existingRequest._id) {
        return res.status(200).json({
            code: 1,
            message: 'Request already sent',
            data: null
        });
    }

    const totalRequests = await FriendRequest.countDocuments({ userId });
    if (totalRequests >= 20) {
        const requestToDelete = await FriendRequest.findOne({ userId, status: { $in: [1, 2] } });
        if (requestToDelete) await FriendRequest.deleteOne({ requestId: requestToDelete.requestId });
    }

    const requestId = (Math.floor(Math.random() * 100000) + 600000).toString();

    const newFriendRequest = new FriendRequest();
    newFriendRequest.setRequestId(requestId);
    newFriendRequest.setUserId(userId);
    newFriendRequest.setMsg(msg || "Let's be friends");
    newFriendRequest.setForId(friendId);
    newFriendRequest.setStatus(0);
    newFriendRequest.setSentFrom(userId);
    newFriendRequest.setSendDate(new Date());

    await newFriendRequest.save();

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
});

router.delete('/api/v1/friends', async (req, res) => {
    const userId = req.headers.userid;
    const friendId = req.query.friendId;
    
    const friends = await Friend.find({ friendFor: userId });
    const hasFriend = friends.some(friend => friend.userId === friendId);
    if (!hasFriend) {
        return res.status(200).json({
            code: 3004,
            message: "The specified friend id is not a valid user",
            data: null
        });
    }

    await Friend.findOneAndDelete({
        userId: String(friendId),
        friendFor: String(userId)
    });
    
    await Friend.findOneAndDelete({
        userId: String(userId),
        friendFor: String(friendId)
    });
    
    res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
});

router.get('/api/v1/friends/requests', async (req, res) => {
    const userId = req.headers.userid;
    
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = 20;
    
    const friendRequests = await FriendRequest.find({ forId: userId })
        .sort({ sendDate: -1 })
        .skip(pageNo * pageSize)
        .limit(pageSize);

    const totalSize = await FriendRequest.countDocuments({ forId: userId });
    const totalPage = Math.ceil(totalSize / pageSize);

    const requestData = await Promise.all(
        friendRequests.map(async (request) => {
            const sender = await User.findOne({ userId: request.sentFrom });
            const senderLanguage = await locale.getUserLocale(request.sentFrom, 'language');

            const senderDetails = {
                requestId: request.requestId,
                nickname: sender ? sender.nickname : '',
                picUrl: sender ? sender.picUrl : '',
                userId: request.sentFrom, // default fields to prevent any errors
                sex: sender ? sender.sex : 0,
                vip: sender ? sender.vip : 0,
                language: senderLanguage
            };

            return {
                requestId: senderDetails.requestId,
                userId: senderDetails.userId,
                msg: request.msg || "Let's be friends",
                status: request.status || 0,
                nickName: senderDetails.nickname,
                picUrl: senderDetails.picUrl,
                vip: senderDetails.vip,
                sex: senderDetails.sex,
                age: 0,
                country: '',
                language: senderDetails.language,
                onlineStatus: 0,
            };
        })
    );

    const responseData = {
        pageNo: parseInt(pageNo),
        pageSize: pageSize,
        totalPage: totalPage,
        totalSize: totalSize,
        data: requestData,
    };

        res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: responseData
    });
});

router.get('/api/v1/friends/recommendation', async (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const userId = req.headers.userid;
    let users = await User.find({ userId: { $ne: userId } }).select('userId sex nickname');
    const formattedUsers = await Promise.all(users.map(async (user) => {
      const langCode = await locale.getUserLocale(user.userId, 'language');
      const languageName = languages[langCode];
      return {
        userId: user.userId,
        sex: user.sex,
        nickName: user.nickname,
        country: languageName,
        picUrl: user.picUrl
      };
    }));
    formattedUsers.sort(() => Math.random() - 0.5);
    const randomized = formattedUsers.slice(0, 10);

    res.status(200).json({ code: 1, message: 'SUCCESS', data: randomized });
});

router.put('/api/v1/friends/:friendId/agreement', async (req, res) => {
    const userId = parseInt(req.headers.userid);
    const friendId = parseInt(req.params.friendId);
    
    const checkRequestExists = async () => {
        const friendRequest = await FriendRequest.findOne({ forId: userId, sentFrom: friendId });
        if (!friendRequest) return { code: 1200, message: 'Friend request not found', data: null };
        return friendRequest;
    };

    const checkFriendExistence = async () => {
        const existingFriend = await Friend.findOne({ userId: userId, friendFor: friendId });
        if (existingFriend) return { code: 3001, message: 'Already friends', data: null };
    };

    const checkFriendLimit = async () => {
        const userFriendCount = await Friend.countDocuments({ friendFor: userId });
        if (userFriendCount >= 500) return { code: 3002, message: 'Exceeded max friends limit', data: null };

        const friendFriendCount = await Friend.countDocuments({ friendFor: friendId });
        if (friendFriendCount >= 500) return { code: 3002, message: 'The user to be friends with exceeded max limit', data: null };
    };

    const getUserData = async (userId) => {
        const user = await User.findOne({ userId });
        if (!user) return { code: 3004, message: 'User does not exist', data: null };
        return user;
    };

    const saveNewFriend = async (userId, friendId) => {
        const user = await getUserData(userId);
        const newFriend = new Friend({
            userId,
            friendFor: friendId
        });

        newFriend.setAlias('');
        
        await newFriend.saveFriend();
    };

    const friendRequest = await checkRequestExists();
    await checkFriendExistence();
    await checkFriendLimit();

    friendRequest.status = 1;
    await friendRequest.save();

    await saveNewFriend(friendId, userId);
    await saveNewFriend(userId, friendId);
    
    res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
});

router.get('/api/v2/friends/:friendId', async (req, res) => {
    const userId = req.headers.userid;
    const friendId = req.params.friendId;
    
   const user = await User.findOne({ userId: friendId });
   const vip = await Vip.findOne({ userId: friendId });
    if (!user) {
        return res.status(200).json({ code: 3004, message: 'The searched user does not exist', data: null });
    }

    const clanMembers = await ClanMember.findOne({ userId: friendId });
    const friendEntry = await Friend.findOne({ userId: friendId, friendFor: userId });

    const responseData = {
        userId: user.userId || '',
        nickName: user.nickname || '',
        picUrl: user.picUrl || '',
        alias: friendEntry ? friendEntry.alias : '',
        status: 30,
        vip: vip.vip || 0,
        expireDate: null, // might wanna let expireDate be nulll to not reveal too much to client about the specified user
        sex: user.sex || 2,
        details: user.introduction || '',
        birthday: "",
        friend: !!friendEntry
    };

    if (clanMembers?.clanId && clanMembers.clanId !== 0) {
        const clan = await Clan.findOne({ clanId: clanMembers.clanId });
        responseData.clanId = clan?.clanId || 0;
        responseData.clanName = clan?.name || null;
        responseData.role = clanMembers.clanRole || 0;
    }
    
    res.status(200).json({ code: 1, message: 'SUCCESS', data: responseData });
});

router.post('/api/v1/friends/:friendId/alias', async (req, res) => {
    const friendId = req.params.friendId;
    const userId = req.headers.userid;
    const alias = req.query.alias;
    
    const friends = await Friend.find({ friendFor: userId });
    const hasFriend = friends.some(friend => friend.userId === friendId);
    if (!hasFriend) {
        return res.status(200).json({
            code: 3004,
            message: "The specified friend id is not a valid user",
            data: null
        });
    }
    
    const friend = await Friend.findOne({ userId: friendId, friendFor: userId });
    
    friend.alias = alias;
    await friend.save();
    
    return res.status(200).json({
        code: 1,
        message: "SUCCESS",
        data: null
    });
});

router.delete('/api/v1/friends/:friendId/alias', async (req, res) => {
    const friendId = req.params.friendId;
    const userId = req.headers.userid;
    
    const friends = await Friend.find({ friendFor: userId });
    const hasFriend = friends.some(friend => friend.userId === friendId);
    if (!hasFriend) {
        return res.status(200).json({
            code: 3004,
            message: "The specified friend id is not a valid user",
            data: null
        });
    }
    
    const friend = await Friend.findOne({ userId: friendId, friendFor: userId });
    
    friend.alias = '';
    await friend.save();
    
    return res.status(200).json({
        code: 1,
        message: "SUCCESS",
        data: null
    });
});

router.get('/api/v1/friends/info/:friendId', async (req, res) => {
    const friendId = parseInt(req.params.friendId);
    res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
});

router.put('/api/v1/friends/:friendId/rejection', async (req, res) => {
    const userId = req.headers.userid;
    const friendId = req.params.friendId;
    
    const friendRequests = await FriendRequest.find({ forId: userId, sentFrom: friendId });

    if (friendRequests.length === 0) {
        return { code: 7, message: 'Friend request not found.', data: null };
    }

    const requestsToReject = friendRequests.filter(req => req.status === 0);

    if (requestsToReject.length === 0) {
        return { code: 11001, message: 'No friend requests to reject', data: null };
    }

    await FriendRequest.updateMany(
        { forId: userId, sentFrom: friendId, status: 0 },
        { status: 2 }
    );
    
    res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
});

module.exports = router;