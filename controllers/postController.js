require('dotenv').config();
const path = require('path');
const { check } = require('express-validator');
const { isLoggedIn, isSuperUser } = require(path.join(__dirname, './auth'));

const Post = require(path.join(__dirname, '../models/post'));

exports.getPosts = function (req, res, next) {
  Post.find()
    .lean()
    .then((posts) => res.json(posts))
    .catch((error) => next(error));
};

exports.createPost = [
  isLoggedIn,
  isSuperUser,
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
  isLoggedIn,
  isSuperUser,
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
  isLoggedIn,
  isSuperUser,
  function editPost(req, res, next) {
    const postID = req.params.id;

    Post.findByIdAndDelete(postID)
      .then(() => res.json({ message: 'post has been deleted' }))
      .catch((error) => next(error));
  },
];
