require('dotenv').config();
const path = require('path');
const { check, validationResult } = require('express-validator');
const { logger } = require(path.join(__dirname, '../config/logger'));

exports.grammar = function (req, res) {
  res.end('grammar');
};
