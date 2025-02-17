﻿
function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
};

async function waitForSelectorVisible(page, selector){
	await page.waitForSelector(selector, {visible: true});
}

async function selectEarlierAvailableDay(page, calendarSelector) {
  return await page.evaluate((selector) => {
    document.querySelector(selector).click();
    const calendarSelector = '#ui-datepicker-div .ui-datepicker-group-first';
    let availableSpot;
    const monthIterations = 14;

    for(let i=0;i<monthIterations;i++){const prev = document.querySelector('#ui-datepicker-div a[data-handler=prev]');if(prev)prev.click();}

    let i = 0;
    while (i < monthIterations) {
      availableSpot = document.querySelector(
          `${calendarSelector} .ui-datepicker-calendar td:not(.ui-datepicker-unselectable)`);
      if (availableSpot) {
        let dayTmp = availableSpot.textContent;
        let monthTmp = document.querySelector(
            `${calendarSelector} .ui-datepicker-month`).textContent;
        let yearTmp = document.querySelector(
            `${calendarSelector} .ui-datepicker-year`).textContent;
        if (new Date(`${dayTmp} ${monthTmp} ${yearTmp}`) >= new Date().setDate(new Date().getDate() + 4)) {
          availableSpot.querySelector('a').click();
          break;
        }
      }
      document.querySelector('#ui-datepicker-div a[data-handler=next]').click();
      i++;
    }

    if (availableSpot) {
      const day = availableSpot.textContent;
      const month = document.querySelector(
          `${calendarSelector} .ui-datepicker-month`).textContent;
      const year = document.querySelector(
          `${calendarSelector} .ui-datepicker-year`).textContent;
      return `${day} ${month} ${year}`;
    }

    return 'none';
  }, calendarSelector);
}

async function selectEarlierAvailableDayCas(page, calendarSelector) {
  //await page.evaluate((selector) => { document.querySelector(selector).click();}, calendarSelector);
  //await delay(500);
  return await page.evaluate((selector) => {
    document.querySelector(selector).click();
    const calendarSelector = '#ui-datepicker-div .ui-datepicker-group-first';
    let availableSpot;
    const monthIterations = 14;

    for(let i=0;i<monthIterations;i++){const prev = document.querySelector('#ui-datepicker-div a[data-handler=prev]');if(prev)prev.click();}

    let i = 0;
    while (i < monthIterations) {
      availableSpot = document.querySelector(
          `${calendarSelector} .ui-datepicker-calendar td:not(.ui-datepicker-unselectable)`);

      if (availableSpot) {
        let dayTmp = availableSpot.textContent;
        let monthTmp = document.querySelector(
            `${calendarSelector} .ui-datepicker-month`).textContent;
        let yearTmp = document.querySelector(
            `${calendarSelector} .ui-datepicker-year`).textContent;
        if (new Date(`${dayTmp} ${monthTmp} ${yearTmp}`) >= new Date().setDate(new Date().getDate() + 1)) {
          availableSpot.querySelector('a').click();
          break;
        }
      }

      document.querySelector('#ui-datepicker-div a[data-handler=next]').click();
      i++;
    }

    if (availableSpot) {
      const day = availableSpot.textContent;
      const month = document.querySelector(
          `${calendarSelector} .ui-datepicker-month`).textContent;
      const year = document.querySelector(
          `${calendarSelector} .ui-datepicker-year`).textContent;
      return `${day} ${month} ${year}`;
    }

    return 'none';
  }, calendarSelector);
}

async function getHoursFromSelect(page, selector) {
  const hoursArray = await page.evaluate((selector) => {
    const options = [];
    document.querySelectorAll(`${selector} option`)
      .forEach(element => {
        if (element.value) {
          options.push(element.value);
        }
      });
  
      return options;
    }, selector
  );
  
  return hoursArray;
}

// This function comes from the source code of the native page.select function of puppeteer.
// Native page.select is not working in the version 14.3.0 when the first option of a select is empty
function selectOption(page, selector, value) {
  return page.evaluate((vals, selector) => {
    const element = document.querySelector(selector);
    const values = new Set(vals);
    if (!(element instanceof HTMLSelectElement)) {
      throw new Error('Element is not a <select> element.');
    }

    const selectedValues = new Set();

    for (const option of element.options) {
      option.selected = false;
    }
    for (const option of element.options) {
      if (values.has(option.value)) {
        option.selected = true;
        selectedValues.add(option.value);
        break;
      }
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return [...selectedValues.values()];
  }, [value], selector);
};

module.exports.delay = delay;
module.exports.waitForSelectorVisible = waitForSelectorVisible;
module.exports.selectEarlierAvailableDay = selectEarlierAvailableDay;
module.exports.getHoursFromSelect = getHoursFromSelect;
module.exports.selectOption = selectOption;
module.exports.selectEarlierAvailableDayCas = selectEarlierAvailableDayCas;
