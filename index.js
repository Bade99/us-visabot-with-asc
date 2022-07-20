require('dotenv').config();

const puppeteer = require('puppeteer');
const chalk = require('chalk');

const login = require('./src/login');
const getCurrentAppointmentDate = require('./src/getCurrentAppointmentDate');
const goToRescheduleAppointment =  require('./src/goToRescheduleAppointment');
const getEarlierSpot = require('./src/getEarlierSpot');
const Logger = require('./src/logger');
const { sendMessage, messageTypes } = require('./src/notifications');
const reserveAppointment = require('./src/reserveAppointment');
const timeIsNight = require("./src/timeIsValid");
const secondsUntilWakeup = require("./src/secondsUntilWakeup");
const setStatus = require("./src/status");
const {delay} = require("./src/utils");
const coolDown = require("./src/coolDown");

const waitingTime = 9;
const logger = new Logger();
let isRunning = false;

const startProcess = async () => {
  console.log(chalk.yellow('⌛ Starting process at ' + new Date().toLocaleString("en-US", {timeZone: "America/Mexico_City"})));
  if (timeIsNight()) {
    console.log(chalk.yellow('⌛ Waiting for the next morning...'));
    await delay(secondsUntilWakeup() * 1000);
    console.log(chalk.green('✅ Waiting finished'));
  }

  console.log(chalk.cyan('✨ Lets start the scrapping...'));
  const browser = await puppeteer.launch({ headless: process.env.NODE_ENV === 'prod' });
  const page = await browser.newPage();
  if (process.env.NODE_ENV === 'dev') {
    await page.setViewport({ width: 1366, height: 900});
  }
  try {
    await page.goto('https://ais.usvisa-info.com/es-mx/niv/users/sign_in');
    await login(page);
    const appointmentDates = await getCurrentAppointmentDate(page);
    await goToRescheduleAppointment(page);
    const earlierDay = await getEarlierSpot(page);
    const isEarlier = new Date(earlierDay) < appointmentDates.consularAppointment;

    logger.updateLog(`${new Date().toISOString()}: Current date: ${appointmentDates.consularAppointment.toDateString()}, earlier spot: ${earlierDay}. earlier: ${isEarlier}`);

    isRunning = true;
    if (isEarlier) {
      await sendMessage(messageTypes.SPOT_AVAILABLE, earlierDay);
      await reserveAppointment(page);
    }
  
  } catch (error) {
    isRunning = false;
    console.log(chalk.red(`❌ ${error.message}`));
  } finally {
    if (process.env.NODE_ENV === 'prod') {
      setStatus(isRunning ? 'running' : 'cooling down');
      console.log(chalk.blue(`🛑 Closing the browser`));
      console.log(chalk.yellow(`⌛ Scraper will run again in ${waitingTime} minutes`));
      console.log();
      console.log();
      await coolDown(isRunning ? 'running' : 'cooling down');
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

