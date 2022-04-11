require('dotenv').config();
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { check } = require('express-validator');
const { logger } = require(path.join(__dirname, '../config/logger'));

const User = require(path.join(__dirname, '../models/user'));

// TODO clean up comments on all pages.

exports.createUser = [
  check('username').trim().escape(),
  check('password').trim().escape(),
  function checkForUser(req, res, next) {
    // check if user exists
    User.findOne({ username: req.body.username })
      .then((userFound) => {
        userFound
          ? res.status(409).json({ message: 'same name exists' })
          : next();
      })
      .catch(next);
  },
  // create user
  async function createUser(req, res, next) {
    let salt;
    let hashedPassword;

    // create salt
    await bcrypt
      .genSalt(10)
      .then((result) => (salt = result))
      .catch(next);

    // create hashed password
    await bcrypt
      .hash(req.body.password, salt)
      .then((result) => (hashedPassword = result))
      .catch(next);

    // create/save user
    await User.create({
      username: req.body.username,
      password: hashedPassword,
    })
      .then(() => res.status(201).json({ message: 'user created' }))
      .catch(next);
  },
];

const time = {
  hour: Math.floor(Date.now() / 1000) + 360,
  ten: Math.floor(Date.now() / 1000) + 360 * 240,
};

// login user
exports.loginUser = [
  check('username').trim().escape(),
  check('password').trim().escape(),
  function checkForUser(req, res, next) {
    passport.authenticate(
      'local',
      { session: false },
      function (error, user, info) {
        // error
        error && next(error);
        // !user
        !user && res.status(401).json({ message: info.message });
        // user found | attach user to req object
        req.user = user;
        user && next();
      }
    )(req, res, next);
  },
];
