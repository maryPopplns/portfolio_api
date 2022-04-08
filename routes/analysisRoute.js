const express = require('express');
const router = express.Router();
const path = require('path');
const { grammar, sentiment } = require(path.join(
  __dirname,
  '../controllers/analysisController'
));

router.post('/grammar', grammar);
router.post('/sentiment', sentiment);

module.exports = router;
