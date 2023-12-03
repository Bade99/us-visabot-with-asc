require('dotenv').config();

//const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const { installMouseHelper } = require('ghost-cursor');
const randUserAgent = require("rand-user-agent");

const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

const chalk = require('chalk');

const Logger = require('./src/logger');
const logger = new Logger();

(function(){
    //saving the original console.log function
    var preservedConsoleLog = console.log;

    //overriding console.log function
    console.log = function() {

        //we can't just call to `preservedConsoleLog` function, that will throw an error (TypeError: Illegal invocation) because we need the function to be inside the scope of the `console` object so we going to use the `apply` function
        preservedConsoleLog.apply(console, arguments);

        //my addition to the `console.log` function
        logger.updateLog(`LOG ${new Date().toLocaleString()}: ${arguments[0].replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')}`);
        //.toLocaleString("en-GB", {hour12: false, timeZone: "America/Argentina/Buenos_Aires"})}
    }
})();

const login = require('./src/login');
const getCurrentAppointmentDate = require('./src/getCurrentAppointmentDate');
const goToRescheduleAppointment =  require('./src/goToRescheduleAppointment');
const getEarlierSpot = require('./src/getEarlierSpot');
const reserveAppointment = require('./src/reserveAppointment');

const { sendMessage, messageTypes } = require('./src/notifications');

const {RestartableError} = require("./src/errors");

const {delay} = require('./src/utils');


const waitingTime = 5; //minutes
let isRunning = false;

const startProcess = async () => {
  
  //INFO: At random points during the day the page stops working for a while and doesn't allow the selection of appointment dates, I didn't find a pattern to it so we simply let the program run all the time no matter what.

  console.log(chalk.yellow('⌛ Starting process at ' + new Date().toLocaleString()));
  console.log(chalk.cyan('✨ Lets start the scrapping...'));
  const browser = await puppeteer.launch({ headless: process.env.NODE_ENV === 'prod', args: ['--remote-debugging-port=9222'] });
  const page = await browser.newPage();
  await page.setDefaultTimeout(80000);
  await page.setViewport({ width: 1366, height: 1600});

  await page.setUserAgent(randUserAgent("desktop","chrome","windows"));

  //await installMouseHelper(page);

  const recorder_config = {
    followNewTab: false,
    fps: 10,
    ffmpeg_Path: null, //INFO: you can specify the path if you already have ffmpeg, eg 'C:/Program Files/ffmpeg-4.2.1-win64-static/bin/ffmpeg.exe', otherwise by default it tries to find ffmpeg by itself, and lastly if it cannot find it then it installs it
    videoFrame: {
      width: 768,
      height: 1024,
    },
    videoCrf: 18,
    videoCodec: 'libx264',
    videoPreset: 'ultrafast',
    videoBitrate: 1000,
    autopad: {
      color: 'black' | '#35A5FF',
    },
    aspectRatio: '3:4',
    recordDurationLimit: 300,
  };
  const recorder = new PuppeteerScreenRecorder(page, recorder_config);
  
  //await recorder.start(`./recordings/rec_${new Date().getTime()}.mp4`);

  let isEarlier = false;
  let recording = false;
  try {
    await page.goto(process.env.visa_page);
    await login(page);
    const appointmentDates = await getCurrentAppointmentDate(page);
    console.log(chalk.cyan(`⌛ Current appointed date: ${appointmentDates.consularAppointment.toDateString()}`));

    await goToRescheduleAppointment(page);

    let first_try = true;
    let retry = true;
    //INFO: we provide the opportunity to do one quick retry in case we can immediately recover from the error by starting again, and thus not lose any time
    while(retry){
        retry = false;
        try {
            const earlierDay = await getEarlierSpot(page);
            
            //INFO: when doing this check we make sure the date is at least 4 days ahead because otherwise you can never get a valid ASC date, also you would get a date that's too early and thus could actually not make it in time and miss your appointment
            isEarlier = new Date(earlierDay) < appointmentDates.consularAppointment && new Date(earlierDay) >= new Date().setDate(new Date().getDate() + 4);

            console.log(chalk.cyan(`Current appointed date: ${appointmentDates.consularAppointment.toDateString()}, earliest spot: ${earlierDay}. earlier than current: ${isEarlier}`));

            isRunning = true;
            if (isEarlier) {
            //if (true) {

              await sendMessage(messageTypes.SPOT_AVAILABLE, earlierDay);

              if (!recording) { recording=true; await recorder.start(`./recordings/rec_${new Date().getTime()}.mp4`); }
              await reserveAppointment(page);
            }
            else{
                console.log(chalk.red('❌ Spot is not earlier than the one already appointed'));
            }
        }
        catch (e) {
            if ((e instanceof RestartableError) && first_try) {
                await page.screenshot({ path: `./screenshots/failed_attempt_${new Date().getTime()}.png`, fullPage: true });
                console.log(chalk.red(`❌ Error is restartable, we will try to run the appointment process again`));
                first_try = false;
                retry = true;
            } else {
                throw e; 
            }
        }
    }
  
  } catch (error) {
    isRunning = false;
    console.log(chalk.red(`❌ ${error.message}`));
    if (error instanceof RestartableError) {
      const restartableWaitTime = 30; //seconds
      console.log(chalk.red(`❌ Error is restartable, process should restart in ${restartableWaitTime} seconds`));
      setTimeout(() => {
        startProcess();
      }, restartableWaitTime * 1000);
    }
    await page.screenshot({ path: `./screenshots/lasterror.png`, fullPage: true });
    if (isEarlier){
        await page.screenshot({ path: `./screenshots/failed_failed_attempt_${new Date().getTime()}.png`, fullPage: true });
    }
  } finally {
    if (process.env.NODE_ENV === 'prod') {
      console.log(chalk.blue(`🛑 Closing the browser`));
      console.log(chalk.yellow(`⌛ Scraper will run again in ${waitingTime} minutes`));
      console.log(chalk.yellow(`---------------------------------------------------`));
      if (recording) { await recorder.stop(); }
      //await recorder.stop();
      await browser.close();
    }
  }
}

if (process.env.NODE_ENV === 'prod') {
  const intervalTime = 1000 * 60 * waitingTime;
  startProcess();

  setInterval(() => {
    startProcess();
  }, intervalTime);
} else {
  startProcess();
}
