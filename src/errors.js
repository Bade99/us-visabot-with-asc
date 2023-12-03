class RestartableError extends Error {
  constructor(message = "", ...args) {
    super(message, ...args);
    this.message = "Something failed, please restart";
    this.value = 3;
  }
}

module.exports.RestartableError = RestartableError;
