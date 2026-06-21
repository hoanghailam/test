const express = require('express');
const fs = require('fs');
const router = express.Router();

const path = require('path');
const fetch = require('node-fetch');

router.get('/files/:filename', async (req, res) => {
    const filename = req.params.filename;
    
    const response = await fetch(`https://static-xenox-service.vercel.app/appconfigs/${filename}.json`);
    if (!response.ok) {
      return res.status(200).json({
            code: 404,
            message: 'Config not found',
            data: null
      });
    }
    
    const data = await response.json();
    
    if (filename == "blockymods-check-version") {
        return res.status(200).json({
            "code": 1,
            "message": "SUCCESS",
            "data": {
                "picUrl": "https://i.ibb.co/3YN62Tw9/20250511-091050.png",
                "versionCode": 0,
                "updateInfo": "NEW:\n- Online & Offline System \n- Actvity System \n\nFixes:\n- Fixed issue with dressing.",
                "forceUpdate": true,
                "newVersionCode": 0,
                "smallerThanVersion": 0,
                "forceUpdateMinVersionCode": 0,
                "forceUpdateMaxVersionCode": 0,
                "apkUrl": "https://www.mediafire.com/file/1qzimbbpn24fr9b/app-blockveil-build-10003-10038-debug.apk/file?dkey=hehr1me8rhi&r=817#",
                "status": 0,
                "url": "https://www.mediafire.com/file/1qzimbbpn24fr9b/app-blockveil-build-10003-10038-debug.apk/file?dkey=hehr1me8rhi&r=817#"
            }
        });
    }
    if (filename == "blockmods-config" || filename == "blockymods-banner" || filename == "blockymods-check-version") {
        return res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: data
        });
    } else {
        return es.status(200).json(data);
    }
});

/*
router.get('/files/blockymods-banner', async (req, res) => {
    const response = await fetch(`https://static-xenox-service.vercel.app/appconfigs/blockymods-banner.json`);
    if (!response.ok) {
      return res.status(200).json({
            code: 404,
            message: 'Config not found',
            data: null
      });
    }
    
    const data = await response.json();
    res.status(200).json({
        code: 1,
        message: 'SUCCESS',
        data: data
    });
});

router.get('/api/v1/first/punch/reward', (req, res) => {
    return res.status(200).json({
        code: 1,
        message: 'SUCCESS',
        data: {}
    });
});
*/

module.exports = router;