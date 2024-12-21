const express = require("express");
const { getFunds } = require("../controllers/fundController");
const router = express.Router();

router.get("/:fundFamily", getFunds);

module.exports = router;
