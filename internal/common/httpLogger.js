const onFinished = require('on-finished');
const chalk = require('chalk');
const logger = require('./logger');

const methodColors = {
  GET: chalk.bold.green,
  POST: chalk.bold.blue,
  PUT: chalk.bold.yellow,
  DELETE: chalk.bold.red,
  PATCH: chalk.bold.magenta,
  OPTIONS: chalk.bold.cyan,
};

const requestLogger = (req, res, next) => {
  const start = Date.now();

  onFinished(res, () => {
    const duration = Date.now() - start;

    let statusColor = chalk.white;
    if (res.statusCode >= 500) statusColor = chalk.red;
    else if (res.statusCode >= 400) statusColor = chalk.yellow;
    else if (res.statusCode >= 300) statusColor = chalk.cyan;
    else if (res.statusCode >= 200) statusColor = chalk.green;

    const methodColor = methodColors[req.method] || chalk.white.bold;
    const method = methodColor(`[${req.method}]`);

    logger.info(`${chalk.white(req.originalUrl)} Sent ${method}: ${statusColor(res.statusCode)} Operation Took: ${chalk.gray(duration + 'ms')}`);
  });
    
    function log(level, message) {
  const now = new Date().toLocaleString();
  console.log(`${chalk.gray(now)} [${LOG_LEVELS[level]}${level}${chalk.reset}] ${message}`);
}
  next();
};

module.exports = requestLogger;