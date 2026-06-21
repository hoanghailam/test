const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const printStartupBanner = require('./printStartupBanner');

const methodColors = {
  GET: chalk.bold.green,
  POST: chalk.bold.blue,
  PUT: chalk.bold.yellow,
  DELETE: chalk.bold.red,
  PATCH: chalk.bold.magenta,
  OPTIONS: chalk.bold.cyan,
  INFO: chalk.bold.white,
  WARN: chalk.bold.yellow,
  ERROR: chalk.bold.red,
};

function log(method = 'INFO', message = '') {
  const now = new Date().toLocaleString();
  const paddedMethod = method.padEnd(0, ' ');
  const colorFn = methodColors[method] || chalk.bold.white;

  const consoleOutput = `${chalk.gray(now)} [${message}]`;
  console.log(consoleOutput);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fatal(message) {
  log('ERROR', `${message}`);
}

function error(message) {
  log('ERROR', `${message}`);
}

function success(message) {
  log('SUCCESS', `${message}`);
}

function info(message) {
  log('INFO', `${message}`);
}

function warn(message) {
  log('WARN', `${message}`);
}

module.exports = {
  log,
  fatal,
  error,
  info,
  warn,
  success
};