require('dotenv').config();
const path = require('path');
const { check } = require('express-validator');
const { logger } = require(path.join(__dirname, '../config/logger'));

exports.client = function (req, res) {
  res.sendFile(path.join(__dirname, '../public/index.html'));
};

exports.contact = function (req, res) {
  res.send('contact');
};
