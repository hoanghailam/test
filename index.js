const express = require('express');
const mongoose = require('mongoose');
const chalk = require('chalk');
const figlet = require('figlet');
const requestLogger = require('./internal/common/httpLogger');
const printStartupBanner = require('./internal/common/printStartupBanner');
const database = require('./internal/common/database');
const logger = require("./internal/common/logger");
const responser = require("./internal/common/response");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

const { generalLimiter, authLimiter } = require('./protection/rateLimiters');
const requireAuth = require('./protection/requireAuth');

// ----------------------
// Utility functions
// ----------------------
function readJSON(filename) {
    return JSON.parse(fs.readFileSync(path.join(__dirname, filename), 'utf-8'));
}

function saveJSON(data, filename) {
    fs.writeFileSync(path.join(__dirname, filename), JSON.stringify(data, null, 4), 'utf-8');
}

function genSign() {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 40; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

// ----------------------
// Routers
// ----------------------
const configRouter = require('./internal/routes/config');
const userRouter = require('./internal/routes/user');
const accountRouter = require('./internal/routes/account');
const clanRouter = require('./internal/routes/clan');
const activityRouter = require('./internal/routes/activity');
const decorRouter = require('./internal/routes/decor');
const friendRouter = require('./internal/routes/friend');
const gameRouter = require('./internal/routes/game');
const msgRouter = require('./internal/routes/msg');
const payRouter = require("./internal/routes/pay");
const mailRouter = require("./internal/routes/mail");
const shopRouter = require("./internal/routes/shop");
const emailRouter = require("./internal/routes/email");

// Connect database
database.connect();

// Middleware
app.use(requestLogger);
app.use(requireAuth);
app.use(responser);
app.use(express.json());

// Routes
app.use('/config', configRouter);
app.use('/user', userRouter);
app.use('/user', accountRouter);
app.use('/user', emailRouter);
app.use('/activity', activityRouter);
app.use('/clan', clanRouter);
app.use('/decoration', decorRouter);
app.use('/friend', friendRouter);
app.use('/game', gameRouter);
app.use('/msg', msgRouter);
app.use('/mailbox', mailRouter);
app.use('/pay', payRouter);

// ✅ FIX: mount shop routes at root so paths match
app.use('/', shopRouter);

// ----------------------
// Dispatcher Endpoints (FIXED)
// ----------------------
app.get('/v1/game-map', (req, res) => {
    try {
        const data = readJSON('dispatchconfig.json'); 
        res.json({
            code: 1,
            message: "success",
            data: {
                downloadUrl: data.data.downurl,
                mapName: data.data.mname,
                cdns: [
                    {
                        cdnId: "1",
                        cdnName: "",
                        cdnUrl: "127.0.0.1",
                        url: data.data.downurl,
                        ratio: 1,
                        base: true
                    }
                ]
            }
        });
    } catch (err) {
        res.status(500).json({ code: 0, message: 'Failed to read game map', error: err.message });
    }
});

// FIXED: Server now trusts client token and forced timestamp
app.post('/v1/dispatch', (req, res) => {
    try {
        const data = readJSON('dispatchconfig.json');

        if(req.body && req.body.token) {
            data.data.signature = req.body.token;
        } else {
            data.data.signature = genSign();
        }

        // Force timestamp to 123456789
        data.data.timestamp = 123456789;

        res.json(data);
    } catch (err) {
        res.status(500).json({ code: 0, message: 'Failed to read dispatch file', error: err.message });
    }
});

// Rate limiters
app.use('/user', authLimiter);
app.use(generalLimiter);

// Static files
app.use('/static', express.static(path.join(__dirname, 'static', 'files')));
app.get('/ping', (req, res) => res.send('pong'));
app.use('/static', (req, res) => {
    return res.status(404).json({
        error: 'Static file not found',
        path: req.path
    });
});

// Root
app.get("/", function(req, res) {
    res.send('OK');
});

// Start server
app.listen(port, () => {
    printStartupBanner(port);
    console.log(chalk.green.bold(`Server started at http://localhost:${port}`));
    console.log('');
});