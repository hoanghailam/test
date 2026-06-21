const express = require('express');
const mongoose = require('mongoose');
const router = express.Router(); 

const tops = require('../config/decoration/tops');
const hairs = require('../config/decoration/hats');
const wings = require('../config/decoration/backs');
const faces = require('../config/decoration/faces');
const emotes = require('../config/decoration/idles');
const colors = require('../config/decoration/colors');
const backgrounds = require('../config/decoration/backgrounds');
const vipColors = require('../config/decoration/vip-colors');

const decorations = [tops, hairs, wings, faces, emotes, colors, backgrounds, vipColors];

const User = require('../models/user-model');
const dressingEquipped = require('../models/dressingEquipped-model');

const DressIds = {
    HAIR: 2,
    GLASSES: 3,
    FACE: 4,
    ACTION: 5,
    SKIN: 6,
    BACKGROUND: 7,
    TOP: 8,
    PANTS: 9,
    SHOES: 10,
    HAT: 11,
    SCARF: 13,
    WINGS: 14,
    CROWN: 15
}

const DressingTypes = {
    "2": "hair",
    "3": "glasses",
    "4": "face",
    "5": "animation",
    "6": "skin",
    "7": "background",
    "8": "top",
    "9": "pants",
    "10": "shoes",
    "11": "hat",
    "13": "scarf",
    "14": "wings",
    "15": "crown"
}

const DressCategories = {
    "8":  1,
    "9":  1,
    "10": 1,
    "2":  2,
    "11": 3,
    "13": 3,
    "14": 3,
    "15": 3,
    "3":  3,
    "4":  4,
    "5":  5,
    "6":  6,
    "7":  7
}

const DressSlaveNames = {
    "2": "custom_hair",
    "3": "custom_glasses",
    "4": "custom_face",
    "5": "animation_idle", // can also be `selectable_action`
    "6": "skin_color",
    "8": "clothes_tops",
    "9": "clothes_pants",
    "10": "custom_shoes",
    "11": "custom_hat",
    "13": "custom_scarf",
    "14": "custom_wing",
    "15": "custom_crown"
}

const DRESS_TYPE_ACTION = "selectable_action";

function filterByKeyValues(data, key, values) {
  if (!Array.isArray(data)) return [];
  return data.filter(item => values.includes(item[key]));
}

router.get('/api/:version/decorations/1', (req, res) => {
   const pageNo = parseInt(req.query.pageNo) || 0;
   const pageSize = parseInt(req.query.pageSize) || 10;
   const result = filterByKeyValues(tops, "sex", [0, 1]);
   
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

        res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: {
                pageNo,
                pageSize,
                totalPage: 0,
                totalSize: 0,
                data: result,
                other: null
            }
        });
});

router.get('/api/:version/decorations/2', (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const result = filterByKeyValues(hairs, "sex", [0, 1]);
   
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

        res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: {
                pageNo,
                pageSize,
                totalPage: 0,
                totalSize: 0,
                data: result,
                other: null
            }
        });
});

router.get('/api/:version/decorations/3', (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const result = filterByKeyValues(wings, "sex", [0, 1]);
   
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

        res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: {
                pageNo,
                pageSize,
                totalPage: 0,
                totalSize: 0,
                data: result,
                other: null
            }
        });
});

router.get('/api/:version/decorations/4', (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
   const pageSize = parseInt(req.query.pageSize) || 10;
   const result = filterByKeyValues(faces, "sex", [0, 1]);
   
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

        res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: {
                pageNo,
                pageSize,
                totalPage: 0,
                totalSize: 0,
                data: result,
                other: null
            }
        });
});

router.get('/api/:version/decorations/5', (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
   const pageSize = parseInt(req.query.pageSize) || 10;
    const result = filterByKeyValues(emotes, "sex", [0, 1]);
   
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

        res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: {
                pageNo,
                pageSize,
                totalPage: 0,
                totalSize: 0,
                data: result,
                other: null
            }
        });
});

router.get('/api/:version/decorations/6', (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
   const pageSize = parseInt(req.query.pageSize) || 10;
    const result = filterByKeyValues(colors, "sex", [0, 1]);
   
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

        res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: {
                pageNo,
                pageSize,
                totalPage: 0,
                totalSize: 0,
                data: result,
                other: null
            }
        });
});

router.get('/api/:version/decorations/7', (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
   const pageSize = parseInt(req.query.pageSize) || 10;
    const result = filterByKeyValues(backgrounds, "sex", [0, 1]);
   
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

        res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: {
                pageNo,
                pageSize,
                totalPage: 0,
                totalSize: 0,
                data: result,
                other: null
            }
        });
});

router.get('/api/:version/decorations/8', (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
   const pageSize = parseInt(req.query.pageSize) || 10;
   
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

        res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: {
                pageNo,
                pageSize,
                totalPage: 0,
                totalSize: 0,
                data: placeholder,
                other: null
            }
        });
});

router.get('/api/:version/vip/decorations/users/6', (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
   const pageSize = parseInt(req.query.pageSize) || 10;
   
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

        res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: {
                pageNo,
                pageSize,
                totalPage: 0,
                totalSize: 0,
                data: vipColors,
                other: null
            }
        });
});

router.get('/api/:version/vip/decorations/users/1', (req, res) => {
    const response = {
  "code": 1,
  "message": "SUCCESS",
  "data": [],
  "other": null
    };

    res.json(response);
});

router.get('/api/:version/vip/decorations/users/3', (req, res) => {
    const response = {
  "code": 1,
  "message": "SUCCESS",
  "data": [],
  "other": null
    };

    res.json(response);
});

router.put('/api/v1/decorations/using/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.headers.userid;
    let foundAvatar = null;

    for (const decoration of decorations) {
        foundAvatar = decoration.find(avatar => avatar.id === parseInt(id, 10));
        if (foundAvatar) break;
    }

    if (!foundAvatar) {
        return res.status(200).json({
            code: 121,
            message: 'Decoration not exist',
            data: null
        });
    }

    const existingEquipped = await dressingEquipped.findOne({
        userId: userId,
        avatarTypeId: foundAvatar.typeId
    });

    if (existingEquipped) {
        await dressingEquipped.deleteOne({
            userId: userId,
            avatarTypeId: foundAvatar.typeId
        });
    }

    const newDressingItem = new dressingEquipped({
        userId: userId,
        avatarId: foundAvatar.id,
        avatarTypeId: foundAvatar.typeId,
        avatarCamera: foundAvatar.camera,
        avatarName: foundAvatar.name,
        avatarIconUrl: foundAvatar.iconUrl,
        avatarResourceId: foundAvatar.resourceId,
        avatarDetails: foundAvatar.details,
        status: 1
    });

    await newDressingItem.save();

    return res.status(200).json({
        code: 1,
        message: 'SUCCESS',
        data: foundAvatar
    });
});

router.delete('/api/v1/decorations/using/:id', async (req, res) => {
    const userId = req.headers.userid;
    const { id: avatarId } = req.params;

    const deletedAvatar = await dressingEquipped.findOneAndDelete({ userId, avatarId });

    if (!deletedAvatar) {
        return res.status(404).json({ code: 6001, message: 'You have not equipped this', data: null });
    }

    const responseData = {
        id: deletedAvatar.avatarId,
        typeId: deletedAvatar.avatarTypeId,
        camera: deletedAvatar.avatarCamera,
        name: deletedAvatar.avatarName,
        iconUrl: deletedAvatar.avatarIconUrl,
        resourceId: deletedAvatar.avatarResourceId,
        details: deletedAvatar.avatarData
    };

    return res.status(200).json({
        code: 1,
        message: 'SUCCESS',
        data: responseData
    });
});

router.delete('/api/v1/decorations/using/:id', async (req, res) => {
    const userId = req.headers.userid;
    const { id: avatarId } = req.params;

    const deletedAvatar = await dressingEquipped.findOneAndDelete({ userId, avatarId });

    if (!deletedAvatar) {
        res.status(404).json({ code: 6001, message: 'You have not equipped this', data: null });
        return;
    }

    const responseData = {
        id: deletedAvatar.avatarId,
        typeId: deletedAvatar.avatarTypeId,
        camera: deletedAvatar.avatarCamera,
        name: deletedAvatar.avatarName,
        iconUrl: deletedAvatar.avatarIconUrl,
        resourceId: deletedAvatar.avatarResourceId,
        details: deletedAvatar.avatarData
    };

    res.status(200).json({
        code: 1,
        message: 'SUCCESS',
        data: responseData
    });
});

router.get('/api/:version/decorations/:otherId/using', async (req, res) => {
    const otherId = req.params.otherId;

    const dressingItems = await dressingEquipped.find({ userId: otherId });

    const responseData = dressingItems.map(dressing => ({
        id: dressing.avatarId,
        typeId: dressing.avatarTypeId,
        camera: dressing.avatarCamera,
        name: dressing.avatarName,
        iconUrl: dressing.avatarIconUrl,
        resourceId: dressing.avatarResourceId,
        details: dressing.avatarDetails,
        price: dressing.avatarPrice,
        currency: dressing.avatarCurrency,
        status: 1
    }));

    res.status(200).json({
        code: 1,
        message: 'SUCCESS',
        data: responseData
    });
});

router.get('/api/v1/decorations/using', async (req, res) => {
    const userId = req.headers.userid;

    const dressingItems = await dressingEquipped.find({ userId });

    const responseData = dressingItems.map(dressing => ({
        id: dressing.avatarId,
        typeId: dressing.avatarTypeId,
        camera: dressing.avatarCamera,
        name: dressing.avatarName,
        iconUrl: dressing.avatarIconUrl,
        resourceId: dressing.avatarResourceId,
        details: dressing.avatarDetails,
        price: dressing.avatarPrice,
        currency: dressing.avatarCurrency,
        status: 1
    }));

    res.status(200).json({
        code: 1,
        message: 'SUCCESS',
        data: responseData
    });
});

module.exports = router;
