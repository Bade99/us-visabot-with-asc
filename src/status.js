const fs = require('fs');

const fsOptions = {
  encoding: 'utf-8',
};

const setStatus = (status) => {
  let output = {
    date: new Date(),
    status: status,
  };
  fs.writeFileSync('./visa.json', JSON.stringify(output), fsOptions);
}

module.exports = setStatus;
