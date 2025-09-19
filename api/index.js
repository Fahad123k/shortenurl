const app = require("../app");
const serverless = require("serverless-http"); // need to install

module.exports = serverless(app);
