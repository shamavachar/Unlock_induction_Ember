const express = require("express");
const router = express.Router();
const { getLiveQueue } = require("../controller/queueController");

router.get("/live", getLiveQueue);

module.exports = router;
