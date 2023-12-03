const { delay , getHoursFromSelect, selectEarlierAvailableDay, selectOption,
  selectEarlierAvailableDayCas, waitForSelectorVisible
} = require('./utils');
const { RestartableError } = require('./errors');
const chalk = require('chalk');

const reserveAppointment = async (page) => {
  console.log(chalk.yellow('⌛ Selecting hour for the consulate appointment...'));
  await delay(500);
  const consulateHourSelector = '#appointments_consulate_appointment_time';
  let hoursArray = [];

  for (let i = 0; i < 6; i++) {
    hoursArray = await getHoursFromSelect(page, consulateHourSelector);
    if (hoursArray.length) { break; }
    else if (i>=5){
      console.log(chalk.red('❌ The hours select for the consulate appointment is still empty'));
      throw new RestartableError();
    }
    else{
      const consulate_retry = 5; /*sec*/
      console.log(chalk.red(`❌ The hours select for the consulate appointment was empty, trying again in ${consulate_retry} seconds`));
      await delay(consulate_retry * 1000);
    }
  }

  //INFO: sometimes the hours dont load, this may be because another user already took it, though most of the time it gets fixed by changing the day and then selecting it again, or just waiting for a bit
  await delay(500);
  const consulate_hour_selected = await selectOption(page, consulateHourSelector, hoursArray[hoursArray.length - 1]);

  console.log(chalk.green('✅ Desired hour to select: ' + hoursArray[hoursArray.length - 1]));
  console.log(chalk.green('✅ Hour selected: ' + consulate_hour_selected));


  await waitForSelectorVisible(page, '#appointments_asc_appointment_date');
  await delay(500);

  let first_try_asc = true
  let retry_asc = true;
  const ASCHourSelector = '#appointments_asc_appointment_time';
  let ASChoursArray = [];

  while(retry_asc){
      retry_asc = false;

      try{
          console.log(chalk.yellow('⌛ Looking for earlier spot for ASC appoinment...'));
          let earlierDayASC = await selectEarlierAvailableDayCas(page, '#appointments_asc_appointment_date');
          console.log(chalk.green('✅ Earlier ASC spot found', earlierDayASC));
          console.log(chalk.yellow('⌛ Selecting hour for the ASC appointment...'));
          await delay(2000 * (first_try_asc?1:5));

          for (let i = 0; i < 6; i++) {
            ASChoursArray = await getHoursFromSelect(page, ASCHourSelector);
            if (ASChoursArray.length) { break; }
            else if (i>=5){
                console.log(chalk.red('❌ The hours select for the ASC appointment is still empty'));
                throw new RestartableError();
            }
            else{
                const asc_retry = 5; /*sec*/
                console.log(chalk.red(`❌ The hours select for the ASC appointment was empty, trying again in ${asc_retry} seconds`));
                await delay(asc_retry * 1000);
            }
          }
      }
      catch (e) {
        if ((e instanceof RestartableError) && first_try_asc) {
            console.log(chalk.red(`❌ Error is restartable, we will try to run the ASC appointment process section again`));
            first_try_asc = false;
            retry_asc = true;
        } else {
            throw e; 
        }
      }
  }

  await delay(500);
  const asc_hour_selected = await selectOption(page, ASCHourSelector, ASChoursArray[ASChoursArray.length - 1]);

  console.log(chalk.green('✅ Desired hour to select: ' + ASChoursArray[ASChoursArray.length - 1]));
  console.log(chalk.green('✅ Hour selected: ' + asc_hour_selected));

  //Here comes the point of no return, where we change our appointment. Thus if you simply want to test that everything works up to here you can simply return at this spot
  //await delay(5000); return; throw new RestartableError(); await delay(100000);

  await delay(500);
  await page.click('#appointments_submit');
  
  //Click the confirmation dialog that appears after submitting:
  await delay(500);
  try{
    //NOTE: on the argentinian page at least there is this extra confirmation modal dialog that only appear after clicking the previous confirmation button
    await page.click('body > div.reveal-overlay > div > div > a.button.alert');
    console.log(chalk.green('✅ Confirmation button was clicked!'));
    console.log(chalk.green('✅ Appointment Submitted, waiting up to 3 minutes for page to respond and confirm submission'));
  }
  catch(error)
  {
      console.log(chalk.red(`❌ Didnt find the confirmation button, will try a different approach, error: ${error.message}`));

      try{
          await page.click('.button.alert');
          console.log(chalk.green('✅ Confirmation button was clicked!'));
          console.log(chalk.green('✅ Appointment Submitted, waiting up to 3 minutes for page to respond and confirm submission'));
      }
      catch(error){
          console.log(chalk.red(`❌ Didnt find the confirmation button, will try a different approach, error: ${error.message}`));
          const buttons = await page.$$('a[class="button alert"]');
          if (buttons.length){
              for (const button of buttons){
                if(window.getComputedStyle(button).getPropertyValue('display') !== 'none'){
                  try{
                    await button.click();
                    console.log(chalk.green('✅ Confirmation button was clicked!'));
                    console.log(chalk.green('✅ Appointment Submitted, waiting up to 3 minutes for page to respond and confirm submission'));
                  } catch(err){}
                }
              }
          }
          else{
              /*Page got reset, try the entire process again*/
              throw new RestartableError();
          }
      }
  }
  
  try {
    //TODO: this should be a Promise.all( confirmation_button.click + page.waitfornavigation)
    await page.waitForNavigation({timeout: 90000});
  }
  catch(error) {
    console.log(chalk.red(`❌ ${error.message}`));
    console.log(chalk.red('❌ Navigation probably timed out, will try to continue normal execution anyway, please review the screenshot to see what happened'));
  }
  await delay(15000);
  await page.screenshot({ path: `./screenshots/reserveAppointment_${new Date().getTime()}.png`, fullPage: true });
  console.log(chalk.green('✅ Appointment reserved succesfully!'));
};

module.exports = reserveAppointment;
