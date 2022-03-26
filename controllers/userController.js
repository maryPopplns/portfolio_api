const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { check } = require('express-validator');
const { logger } = require(path.join(__dirname, '../config/logger'));

const User = require(path.join(__dirname, '../models/user'));

exports.createUser = [
  check('username').trim().escape(),
  check('password').trim().escape(),
  function (req, res, next) {
    //
  },
];
