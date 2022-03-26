require('dotenv').config();
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
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
  // create user
  async function createUser(req, res, next) {
    let salt;
    let hashedPassword;

    // create salt
    await bcrypt
      .genSalt(10)
      .then((result) => (salt = result))
      .catch((error) => next(error));

    // create hashed password
    await bcrypt
      .hash(req.body.password, salt)
      .then((result) => (hashedPassword = result))
      .catch((error) => next(error));

    // create/save user
    await User.create({
      username: req.body.username,
      password: hashedPassword,
    })
      .then(() => res.status(200).end('user successfully created'))
      .catch((error) => next(error));
  },
];

const time = {
  hour: Math.floor(Date.now() / 1000) + 60 * 60,
  day: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
};

// login user
exports.loginUser = [
  check('username').trim().escape(),
  check('password').trim().escape(),
  function loginUser(req, res, next) {
    passport.authenticate(
      'local',
      { session: false },
      function (error, user, info) {
        // error || !user
        error && next(error);
        !user && res.status(400).json({ message: info.message });

        // user found
        req.user = user;
        next();
      }
    )(req, res, next);
  },
  function sendJWT(req, res, next) {
    req.login(req.user, { session: false }, (error) => {
      error && next(error);

      const token = jwt.sign(
        {
          data: req.user.toJSON(),
          exp: process.env.ENV === 'dev' ? time.day : time.hour,
        },
        process.env.JWT_SECRET
      );
      // send token/user
      res.json({ user: req.user, token });
    });
  },
];
