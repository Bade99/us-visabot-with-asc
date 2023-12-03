const nodemailer = require('nodemailer');
const chalk = require('chalk');
const Pushover = require('pushover-js').Pushover; //const {Pushover} = require("pushover-js");

const { NOTIFICATIONS_MAIL, NOTIFICATIONS_SECRET, email, PUSHOVER_USER, PUSHOVER_TOKEN, visa_page } = process.env;

const pushover = PUSHOVER_USER && PUSHOVER_TOKEN ? new Pushover(PUSHOVER_USER, PUSHOVER_TOKEN) : null;

const transporter = NOTIFICATIONS_MAIL && NOTIFICATIONS_SECRET ? nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: NOTIFICATIONS_MAIL,
    pass: NOTIFICATIONS_SECRET,
  },
}) : null;

transporter?.verify()
  .then(() => console.log(chalk.blue('📧 System ready to send email notifications')));

const notifySpotAvailable = async (date) => {
  
  /*await*/ pushover?.setSound('gamelan').setMessage(`Visa spot available on ${date}!`).setPriority(2, 420, 30).setUrl(visa_page).send(`📅 ${date} is available for consulate appointment!`);

  /*await*/ transporter?.sendMail({
    from: `Visa Alerts <${NOTIFICATIONS_MAIL}>`,
    to: email,
    subject: `Visa spot available on ${date}`,
    html: `<b><a href="${visa_page}">Reserve your spot now!</a></b>`
  });
};

const messageTypes = {
  SPOT_AVAILABLE: 'spotAvailable',
};

const notifsMap = {
  [messageTypes.SPOT_AVAILABLE]: notifySpotAvailable,
};


const sendMessage = (messageType, context) => {
  if (notifsMap[messageType]) {
    notifsMap[messageType](context);
  } else {
    console.log(chalk.red(`❌ Message type ${messageType} does not exist.`));
  }
};

module.exports.messageTypes = messageTypes;
module.exports.sendMessage = sendMessage;
