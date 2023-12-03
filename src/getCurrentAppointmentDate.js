const chalk = require('chalk');

const dateMapper = (appointmentString) => {
  const [_1, _2, date] = appointmentString.split('\n');
  const noCommas = date.trim().replaceAll(',', '');
  const [day, _month, year, hour] = noCommas.split(' ');
  let month = _month;
  switch(_month){
      case 'enero': month = 'january'; break;
      case 'febrero': month = 'february'; break;
      case 'marzo': month = 'march'; break;
      case 'abril': month = 'april'; break;
      case 'mayo': month = 'may'; break;
      case 'junio': month = 'june'; break;
      case 'julio': month = 'july'; break;
      case 'agosto': month = 'august'; break;
      case 'septiembre': month = 'september'; break;
      case 'octubre': month = 'october'; break;
      case 'noviembre': month = 'november'; break;
      case 'diciembre': month = 'december'; break;
  }
  return new Date(`${day} ${month} ${year}`);
};

const getCurrentAppointmentDate = async (page) => {
  await page.waitForSelector('p.consular-appt');

  const consularAppointment = await page.evaluate(() => {
    const element = document.querySelector('p.consular-appt');
    return element.textContent;
  });

  const ASCAppointment = await page.evaluate(() => {
    const element = document.querySelector('p.asc-appt');
    return element.textContent;
  });

  console.log(chalk.green('✅ Getting current appointment dates successful'));

  return {
    consularAppointment: dateMapper(consularAppointment),
    ASCAppointment: dateMapper(ASCAppointment),
  };
};

module.exports = getCurrentAppointmentDate;
