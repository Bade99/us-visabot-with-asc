const secondsUntilWakeup = () => {
  const wakeupTime = 13;
  const currentTime = new Date().getHours();
  return (wakeupTime - currentTime) * 60 * 60;
}

module.exports = secondsUntilWakeup;
