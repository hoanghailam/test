const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const router = express.Router();
const fs = require('fs');

const Game = require('../models/game-model');
const GameLike = require('../models/gamelike-model');
const User = require('../models/user-model');
const Friend = require('../models/friend-model');
const Account = require('../models/account-model');

const app = express();
app.use('/static', express.static(path.join(__dirname, 'static')));

// Middleware to verify user token
async function verifyUserToken(req, res, next) {
    const userId = req.headers.userid;
    const accessToken = req.headers['access-token'];

    if (!userId || !accessToken) {
        return res.status(401).json({ code: 401, message: 'Missing userid or access-token', data: null });
    }

    const account = await Account.findOne({ userId, accessToken });
    if (!account) {
        return res.status(110).json({ code: 110, message: 'Check user token failed', data: null });
    }

    next();
}

// Announcement routes
router.get('/api/v1/games/announcement/info', async (req, res) => {
    res.status(200).json({ code: 1, message: 'SUCCESS', data: {} });
});

router.get('/api/v1/games/stop/announcement/info', async (req, res) => {
    res.status(200).json({ code: 1, message: 'SUCCESS', data: {} });
});

// Recommendation routes
router.get('/api/:version/games/recommendation/type', async (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const count = 5;
    const randomGames = await Game.aggregate([{ $sample: { size: count } }]);

    if (pageNo !== 0) {
        return res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: { pageNo, pageSize, totalPage: 0, totalSize: 0, data: [] }
        });
    }

    res.status(200).json({
        code: 1,
        message: 'SUCCESS',
        data: { pageNo, pageSize, totalPage: 0, totalSize: 0, data: randomGames, other: null }
    });
});

router.get('/api/:version/games/recommendation', async (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const count = 5;
    const randomGames = await Game.aggregate([{ $sample: { size: count } }]);

    if (pageNo !== 0) {
        return res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: { pageNo, pageSize, totalPage: 0, totalSize: 0, data: [] }
        });
    }

    res.status(200).json({
        code: 1,
        message: 'SUCCESS',
        data: { pageNo, pageSize, totalPage: 0, totalSize: 0, data: randomGames, other: null }
    });
});

// Recently playlist
router.get('/api/v1/games/playlist/recently', async (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const count = 5;
    const randomGames = await Game.aggregate([{ $sample: { size: count } }]);

    if (pageNo !== 0) {
        return res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: { pageNo, pageSize, totalPage: 0, totalSize: 0, data: [] }
        });
    }

    res.status(200).json({
        code: 1,
        message: 'SUCCESS',
        data: { pageNo, pageSize, totalPage: 0, totalSize: 0, data: randomGames, other: null }
    });
});

// General games list
router.get('/api/:version/games', async (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;

    try {
        const gamesJson = await Game.find({});
        if (pageNo !== 0) {
            return res.status(200).json({
                code: 1,
                message: 'SUCCESS',
                data: { pageNo, pageSize, totalPage: 0, totalSize: 0, data: [] }
            });
        }

        res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: { pageNo, pageSize, totalPage: 0, totalSize: 0, data: gamesJson, other: null }
        });
    } catch (err) {
        console.error('Error searching for recommended games:', err);
        res.status(500).json({ message: 'Error searching for recommended games.' });
    }
});

router.get('/api/v1/games/update/list/:userId', async (req, res) => {
    return res.status(200).json({ code: 4, message: "INNER ERROR", data: null });
});

router.get('/api/v1/games/ugc', async (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const count = 5;
    const randomGames = await Game.aggregate([{ $sample: { size: count } }]);

    if (pageNo !== 0) {
        return res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: { pageNo, pageSize, totalPage: 0, totalSize: 0, data: [] }
        });
    }

    res.status(200).json({
        code: 1,
        message: 'SUCCESS',
        data: { pageNo, pageSize, totalPage: 0, totalSize: 0, data: randomGames, other: null }
    });
});

router.get('/api/v1/games/ugc/status', async (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;

    if (pageNo !== 0) {
        return res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: { pageNo, pageSize, totalPage: 0, totalSize: 0, data: [] }
        });
    }

    res.status(200).json({
        code: 1,
        message: 'SUCCESS',
        data: { pageNo, pageSize, totalPage: 0, totalSize: 0, data: null, other: null }
    });
});

// Engine upgrade
router.get('/api/v1/games/app-engine/upgrade', async (req, res) => {
    return res.status(200).json({ code: 1, message: "SUCCESS", data: {} });
});

router.get('/api/v1/games/update/tip/info/app/:gameId', async (req, res) => {
    const gameId = req.params.gameId;
    return res.status(200).json({ code: 1, message: "SUCCESS", data: { count: 10040, content: "New engine update!" }});
});

// Single game info (protected)
router.get('/api/v2/games/:gameId', verifyUserToken, async (req, res) => {
    const gameId = req.params.gameId;
    const userId = req.headers.userid;

    const gameData = await Game.findOne({ gameId });
    if (!gameData) return res.status(200).json({ code: 2002, message: "The specified game does not exist", data: null });

    const user = await User.findOne({ userId: gameData.authorId });
    if (!user) return res.status(200).json({ code: 2002, message: "The specified game does not exist", data: null });

    let friendEntry = (gameData.authorId == userId) ? false : await Friend.findOne({ userId: gameData.authorId, friendFor: userId });

    const gameLikes = await GameLike.find({ userId });
    const likedGameIds = gameLikes.map(like => like.gameId);
    const likedGameData = likedGameIds.includes(gameId);

    return res.status(200).json({ 
        code: 1,
        message: "SUCCESS",
        data: {
            gameId: gameId,
            gameName: gameData.gameTitle,
            gameDetail: gameData.gameDetails,
            gameTypes: gameData.gameTypes,
            appreciate: likedGameData,
            praiseNumber: gameData.praiseNumber,
            bannerPic: [`https://static-xenox-service.vercel.app/game-banners/${gameId}.png`],
            warmUpResponse: {
                gameId: gameId,
                bannerPic: [`https://static-xenox-service.vercel.app/game-banners/${gameId}.png`],
                gameDetail: gameData.gameDetails,
                featuredPlay: gameData.featuredPlay
            },
            authorInfo: {
                userId: gameData.authorId,
                nickName: user.nickname,
                headPic: user.picUrl,
                isAddFriend: !!friendEntry ? 1 : 0
            }
        }
    });
});

// Praise a game (protected)
async function praiseGame(gameId) {
    const updated = await Game.findOneAndUpdate({ gameId }, { $inc: { praiseNumber: 1 } }, { new: true });
    if (!updated) throw new Error(`Game with gameId ${gameId} not found.`);
    return updated.praiseNumber;
}

router.put('/api/v1/games/:gameId/appreciation', verifyUserToken, async (req, res) => {
    const gameId = req.params.gameId;
    const userId = req.headers.userid;

    const gameData = await Game.findOne({ gameId });
    if (!gameData) return res.status(200).json({ code: 2002, message: "The specified game does not exist", data: null });

    const alreadyLiked = await GameLike.exists({ gameId, userId });
    if (alreadyLiked) return res.status(200).json({ code: 2005, message: "You already liked this game", data: null });

    await new GameLike({ gameId, userId }).save();
    await praiseGame(gameId);

    res.status(200).json({ code: 1, message: "SUCCESS", data: null });
});

module.exports = router;