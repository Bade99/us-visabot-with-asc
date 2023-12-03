const chalk = require('chalk');
const { delay, selectEarlierAvailableDay, waitForSelectorVisible } = require('./utils');

const getEarlierSpot = async (page) => {
  await waitForSelectorVisible(page, '#appointments_consulate_appointment_date');
  console.log(chalk.yellow('⌛ Appointments page loaded...'));
  await delay(4000);//NOTE: a long delay is required here because sometimes the page decides to reload its elements after a bit, for whatever reason
  console.log(chalk.yellow('⌛ Looking for spots avilable for consulate appointment...'));
  let earlierDay = await selectEarlierAvailableDay(page, '#appointments_consulate_appointment_date');
  if(earlierDay === 'none'){
	  await page.screenshot({ path: `./screenshots/lastnone.png`, fullPage: true });
	  console.log(chalk.red('❌ Couldnt find any date to select, trying again in a bit'));
	  await delay(5000);
	  earlierDay = await selectEarlierAvailableDay(page, '#appointments_consulate_appointment_date');
	  await page.screenshot({ path: `./screenshots/lastnone2.png`, fullPage: true });
  }
  console.log(chalk.green('✅ Earliest Spot found:', earlierDay));

  return earlierDay;
};

module.exports = getEarlierSpot;
