const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { check } = require('express-validator');
const res = require('express/lib/response');
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
        user ? res.status(409).end('user with same name exists') : next();
      })
      .catch((error) => next(error));
  },
  async function createUser(req, res, next) {
    let salt;
    let hashedPassword;

    // create salt
    await bcrypt
      .genSalt(10)
      .then((result) => (salt = result))
      .catch((error) => next(error));

    // hash password
    await bcrypt
      .hash(req.body.password, salt)
      .then((result) => (hashedPassword = result))
      .catch((error) => next(error));

    // create user
    await User.create({
      username: req.body.username,
      password: hashedPassword,
    })
      .then(() => res.status(200).end('user successfully created'))
      .catch((error) => next(error));
  },
];

exports.loginUser = [
  check('username').trim().escape(),
  check('password').trim().escape(),
  function loginUser(req, res, next) {
    res.end('login');
  },
];
