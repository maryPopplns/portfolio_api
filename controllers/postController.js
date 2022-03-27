const { check } = require('express-validator');

exports.createPost = [
  check('username').trim().escape(),
  check('password').trim().escape(),
  function authentication(req, res) {
    res.json({ user: req.user || 'none' });
  },
];
