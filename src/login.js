const chalk = require('chalk');
const { createCursor, getRandomPagePoint } = require('ghost-cursor');

const credentials = {
  email: process.env.email,
  password: process.env.password,
};

const login = async (page) => {
  const cursor = createCursor(page, await getRandomPagePoint(page), true);
  const cursor_args = { waitForClick: 50, moveDelay: 300 };

  await page.waitForSelector('input.email');

  console.log(chalk.green('⌛ Login start'));

  await cursor.move('input.email', cursor_args);

  await page.focus('input.email');
  await page.keyboard.type(credentials.email, {delay: 90});

  await cursor.move('input.password', cursor_args);

  await page.focus('input.password');
  await page.keyboard.type(credentials.password, {delay: 90});

  await cursor.click('input#policy_confirmed', cursor_args);

  await cursor.click('input[type=submit]', cursor_args);

  console.log(chalk.green('✅ Login successful'));
};

module.exports = login;
