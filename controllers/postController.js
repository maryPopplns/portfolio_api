const { check } = require('express-validator');
const { response } = require('../app');

exports.createPost = [
  check('username').trim().escape(),
  check('password').trim().escape(),
  function authentication(req, res) {
    res.end('auth');
  },
];
