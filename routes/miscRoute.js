const express = require('express');
const router = express.Router();
const path = require('path');
const { client, contact } = require(path.join(
  __dirname,
  '../controllers/miscController'
));

router.get('/client', client);
router.post('/contact', contact);

module.exports = router;
