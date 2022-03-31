require('dotenv').config();
const path = require('path');
const { check } = require('express-validator');

const Post = require(path.join(__dirname, '../models/post'));

exports.getPosts = function (req, res, next) {
  Post.find()
    .lean()
    .then((posts) => res.json(posts))
    .catch((error) => next(error));
};

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

exports.editPost = [
  function isLoggedIn(req, res, next) {
    req.user && next();
    !req.user && res.status(401).json({ messsage: 'unauthorized' });
  },
  function isSuperUser(req, res, next) {
    const isSuperUser = req.user.superUser;
    isSuperUser && next();
    !isSuperUser && res.status(403).json({ message: 'forbidden' });
  },
  function editPost(req, res, next) {
    const postID = req.params.id;
    const updatedPost = {
      title: req.body.title,
      body: req.body.body,
    };

    Post.findByIdAndUpdate(postID, updatedPost)
      .then(() => res.json({ message: 'post has been updated' }))
      .catch((error) => next(error));
  },
];

exports.deletePost = [
  function isLoggedIn(req, res, next) {
    req.user && next();
    !req.user && res.status(401).json({ messsage: 'unauthorized' });
  },
  function isSuperUser(req, res, next) {
    const isSuperUser = req.user.superUser;
    isSuperUser && next();
    !isSuperUser && res.status(403).json({ message: 'forbidden' });
  },
  function editPost(req, res, next) {
    const postID = req.params.id;

    Post.findByIdAndDelete(postID)
      .then(() => res.json({ message: 'post has been deleted' }))
      .catch((error) => next(error));
  },
];
