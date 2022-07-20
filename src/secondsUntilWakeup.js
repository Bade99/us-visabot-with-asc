const secondsUntilWakeup = () => {
  const wakeupTime = 13;
  const currentTime = new Date().getHours();
  console.log((wakeupTime - currentTime) * 60 * 60)
  return (wakeupTime - currentTime) * 60 * 60;
}

module.exports = secondsUntilWakeup;
