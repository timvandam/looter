'use strict';

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const opn = require('opn');
const Spinner = require('cli-spinner').Spinner;

const { askSteamCredentials, askSteamAuthCode, askSteamCaptcha, askAutoConfirm, askSteamIdentitySecret, askWhichInventory, askTradeLink, askTradeAmount } = require('./lib/inquirer');
const { logon } = require('./lib/logon');
const { getInventory, sendTrade } = require('./lib/inventory');

const includes = l => b => t => l.includes(t) === b;
const error = msg => console.log(chalk.red(msg));
const good = msg => console.log(chalk.green(msg));
const info = msg => console.log(chalk.cyan(msg));
const sleep = ms => new Promise(done => setTimeout(done, ms));
const title = () => {
  clear();
  good(figlet.textSync('Looter'));
};

const run = async(credentials, auth, captcha) => {
  if (!credentials) credentials = await askSteamCredentials();

  // Log onto steamcommunity.com
  const login = await logon({ ...credentials, ...auth, ...captcha });

  // Handle login errors
  if (Array.isArray(login)) {
    const [res, det] = login;
    if (res === 'AUTH')
      run(credentials, { [det === 'SteamGuard' ? 'steamguard' : 'twoFactorCode']: (await askSteamAuthCode()).code }, captcha);

    if (res === 'CAPTCHA') {
      opn(det);
      run(credentials, auth, await askSteamCaptcha());
    }

    if (res === 'TIMEOUT')
      process.exit(error('Steam has temporarily blocked you from attempting to log in. Try again later.'));

    if (res === 'INCORRECT') {
      title();
      error('Your credentials are incorrect.');
      run(null, auth, captcha);
    }

    if (res === 'UNKNOWN') {
      title();
      error('Something went wrong while attempting to log in.');
      run(null, auth, captcha);
    }

    return;
  }

  title();

  const { manager, community } = login;

  // Get mandatory details
  const { autoConfirm } = await askAutoConfirm();
  const { identitySecret } = autoConfirm ? await askSteamIdentitySecret() : {};

  const { tradeLink } = await askTradeLink();

  const { tradeAmount } = await askTradeAmount();

  const { appid, contextid } = await askWhichInventory();

  // Bring up spinner and load inventory
  const invSpinner = new Spinner('Loading your inventory');
  invSpinner.setSpinnerDelay(75).start();
  const inventory = await getInventory(appid, contextid, manager);
  invSpinner.stop();

  title();

  // Couldn't fetch inventory
  if (inventory === 'ERROR')
    return process.exit(error('Something went wrong while loading your inventory.'));

  info(`Transferring ${inventory.length} items. (${appid}-${contextid})`);
  const itemsPerTrade = Math.ceil(inventory.length / tradeAmount);
  while (inventory.length) {
    const trade = await sendTrade(manager, tradeLink, inventory.splice(0, itemsPerTrade), ...(autoConfirm ? [community, identitySecret] : []));

    // Handle errors
    if (trade === 'ERROR')
      return process.exit(error('Something went wrong while getting ESCROW status. Make sure that your receiving inventory is public.'));

    if (trade === 'PROBATION')
      return process.exit(error('The account you want to transfer your items to has been trade banned.'));

    if (trade === 'ESCROW')
      return process.exit(error('This trade would result in a trade hold.'));

    if (trade === 'TRADEERROR')
      error('Something went wrong while sending your trade.');

    if (trade === 'CONFIRMATIONERROR')
      error('Could not confirm trade.');

    info(`Trade ${tradeAmount - Math.floor(inventory.length / itemsPerTrade)}/${tradeAmount} sent.`);
  }

  good('All your trades have been sent! :)');
  process.exit();
};

title();
run();