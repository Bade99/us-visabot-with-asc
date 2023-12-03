const chalk = require('chalk');
const { createCursor, getRandomPagePoint } = require('ghost-cursor');
const { delay, waitForSelectorVisible } = require('./utils');

const goToRescheduleAppointment = async (page) => {
  const cursor = createCursor(page, await getRandomPagePoint(page), true);
  const cursor_args = { waitForClick: 50, moveDelay: 300 };

  await waitForSelectorVisible(page, '.dropdown a.button.primary');
  await delay(300);

  //await page.click('.dropdown a.button.primary');
  for(let i=0;i<8;i++)
  {
    try{
      await cursor.click('.dropdown a.button.primary', cursor_args);

      //TODO: instead of checking for the selector we should check whether the url has changed, since loading the new page could be what's taking a long time
      //IMPORTANT INFO: the accordion item index that should be selected may be different for different countries (original source code had it set to 3, I had to set it to 4 because they had added a new promotion as the first item)
      await page.waitForSelector('.accordion-item:nth-child(4) .accordion-content a', {timeout: 10000});
    }
    catch(e){
      if (i < 7) {
        console.log(chalk.yellow('⌛ Couldnt click button selector, trying again'));
        continue;
      }
      else throw e;
    }
    break;
  }

  /*TODO: had to take this out because it had inconsistent results, it would click other accordion items somehow
  for(let i=0;i<8;i++)
  {
    try{
    await cursor.click('.accordion-item:nth-child(4) a', cursor_args);
    await page.waitForSelector('.accordion-item:nth-child(4) .accordion-content a', {timeout: 1000, visible:true});
    }
    catch(e){
      if (i < 7) {
        console.log(chalk.yellow('⌛ Couldnt click accordion selector, trying again'));
        continue;
      }
      else throw e;
    }
    break;
  }
  
  await cursor.click('.accordion-item:nth-child(4) .accordion-content a', cursor_args);
  */

  const now = new Date();
  if((now.getMinutes() % 5)==4){ /*we are about to enter into a new 5 minute cycle*/
    const wait_threshold = 57; /*seconds*/
    const now_seconds = now.getSeconds();
    if(now_seconds < wait_threshold){
        const seconds_wait = wait_threshold - now_seconds;
        console.log(chalk.yellow(`⌛ Awaiting ${seconds_wait} seconds to enter into the next 5 minute cycle`));
        await delay(seconds_wait * 1000);
    }
  }
  
  await page.evaluate(() => {
    document.querySelector('.accordion-item:nth-child(4) .accordion-content a').click();
  })
  

  console.log(chalk.green('✅ Going to reschedule page successful'));
};

module.exports = goToRescheduleAppointment;
