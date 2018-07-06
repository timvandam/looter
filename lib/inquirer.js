const inquirer = require('inquirer');

const validate = e => !!e && e.length > 3;
const validateNumber = e => e && !isNaN(e);

module.exports = a = {
  askSteamCredentials: () =>
    inquirer.prompt([{
        name: 'accountName',
        type: 'input',
        message: 'Please enter your Steam username',
        validate
      },
      {
        name: 'password',
        type: 'password',
        message: 'Please enter your Steam password',
        validate
      }
    ]),
  askSteamCaptcha: () =>
    inquirer.prompt([{
      name: 'captcha',
      type: 'input',
      message: 'Please solve and enter your captcha',
      validate
    }]),
  askSteamAuthCode: () =>
    inquirer.prompt([{
      name: 'code',
      type: 'input',
      message: 'Please enter your authentication code',
      validate
    }]),
  askAutoConfirm: () =>
    inquirer.prompt([{
      name: 'autoConfirm',
      type: 'confirm',
      message: 'Auto confirm? (requires identity secret)'
    }]),
  askSteamIdentitySecret: () =>
    inquirer.prompt([{
      name: 'identitySecret',
      type: 'input',
      message: 'What is your steam identity secret?',
      validate: e => /[a-zA-Z0-9+=/]{28}/.test(e)
    }]),
  askTradeLink: () =>
    inquirer.prompt([{
      name: 'tradeLink',
      type: 'input',
      message: 'Please enter the tradelink to transport your items to',
      validate: e => /steamcommunity\.com\/tradeoffer\/new\/\?partner=[0-9]*&token=[a-zA-Z0-9_-]*/i.test(e)
    }]),
  askWhichInventory: () =>
    inquirer.prompt([{
        name: 'appid',
        type: 'input',
        message: 'Which AppID should be used?',
        validate: validateNumber
      },
      {
        name: 'contextid',
        type: 'input',
        message: 'Which ContextID should be used?',
        validate: validateNumber
      }
    ]),
  askTradeHold: () =>
    inquirer.prompt([{
      name: 'tradeHoldOK',
      type: 'confirm',
      message: 'This trade would result in a trade hold. Proceed?'
    }])
};