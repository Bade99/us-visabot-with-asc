const fs = require('fs');
const {Pushover} = require("pushover-js");
const { PUSHOVER_USER, PUSHOVER_TOKEN } = process.env;

const fsOptions = {
  encoding: 'utf-8',
};
const pushover = new Pushover(PUSHOVER_USER, PUSHOVER_TOKEN)

const coolDown = async (status) => {
  const rawdata = fs.readFileSync('./visa.json', fsOptions);
  const data = JSON.parse(rawdata);

  if (data.status !== status) {
    await pushover.setSound('none').setMessage(
        `Bot is now ${status}`).setPriority(-1).send(
        `Bot is now ${status}`);
  }
}

module.exports = coolDown;
