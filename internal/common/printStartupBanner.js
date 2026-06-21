const chalk = require('chalk');
const figlet = require('figlet');

const printStartupBanner = (port) => {
  console.log('');
  console.log(chalk.magenta(figlet.textSync('BlockmanUtil', { horizontalLayout: 'default' })));
  console.log('');
  console.log(chalk.green.bold('╔══════════════════════════════════════════╗'));
  console.log(chalk.green.bold('║') + ` 🚀 Listening on: ${chalk.cyan(`http://localhost:${port}`)} ` + chalk.green.bold('║'));
  console.log(chalk.green.bold('╚══════════════════════════════════════════╝'));
  console.log('');
  console.log(chalk.green.bold('╔══════════════════════════════════════════╗'));
  console.log(chalk.green.bold('║') + ` 🔥 Version ${chalk.cyan(`1.9.17`)} ` + chalk.green.bold('║'));
  console.log(chalk.green.bold('╚══════════════════════════════════════════╝'));
  console.log('');
};

module.exports = printStartupBanner;