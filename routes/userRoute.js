const express = require('express');
const router = express.Router();
const path = require('path');
const { createUser } = require(path.join(
  __dirname,
  '../controllers/userController'
));

router.post('/create', createUser);

module.exports = router;
