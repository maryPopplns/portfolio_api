const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { check } = require('express-validator');
const { logger } = require(path.join(__dirname, '../config/logger'));

const User = require(path.join(__dirname, '../models/user'));

exports.createUser = [
  check('username').trim().escape(),
  check('password').trim().escape(),
  function checkForUser(req, res, next) {
    // check if user exists
    User.find({ username: req.body.username })
      .then((result) => {
        const user = result[0];
        user ? res.status(409).json() : next();
      })
      .catch((error) => next(error));
  },
  async function createUser(req, res, next) {
    // create salt
    let salt;
    await bcrypt
      .genSalt(10)
      .then((result) => (salt = result))
      .catch((error) => next(error));

    // hash password
    let hashedPassword;
    salt &&
      (await bcrypt
        .hash(req.body.password, salt)
        .then((result) => (hashedPassword = result))
        .catch((error) => next(error)));

    // create user
    hashedPassword &&
      (await User.create({
        username: req.body.username,
        password: hashedPassword,
      })
        .then((result) => res.status(200).json())
        .catch((error) => next(error)));
  },
];
