require('dotenv').config();
const path = require('path');
const { check } = require('express-validator');

const Post = require(path.join(__dirname, '../models/post'));

exports.createPost = [
  function isLoggedIn(req, res, next) {
    req.user && next();
    !req.user && res.status(401).json({ messsage: 'unauthorized' });
  },
  function isSuperUser(req, res, next) {
    const isSuperUser = req.user.superUser;
    isSuperUser && next();
    !isSuperUser && res.status(403).json({ message: 'forbidden' });
  },
  check('title').trim().escape(),
  check('body').trim().escape(),
  function savePost(req, res, next) {
    // create/save post
    Post.create({
      title: req.body.title,
      body: req.body.body,
    })
      .then(() => res.status(201).json({ message: 'post created' }))
      .catch((error) => next(error));
  },
];
