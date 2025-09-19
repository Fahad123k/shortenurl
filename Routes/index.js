const express = require("express");
const router = express.Router();

//  must match file names exactly
const urlRoute = require("./urlRoute");
const statsRoute = require("./statsRoute");

router.use("/url", urlRoute);
router.use("/stats", statsRoute);


module.exports = router;
