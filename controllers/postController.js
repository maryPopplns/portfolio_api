require('dotenv').config();
const path = require('path');
const async = require('async');
const { check } = require('express-validator');
const { isLoggedIn, isSuperUser } = require(path.join(__dirname, './auth'));

const Post = require(path.join(__dirname, '../models/post'));
const User = require(path.join(__dirname, '../models/user'));

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

exports.likePost = [
  isLoggedIn,
  function preventDoubleLike(req, res, next) {
    const likedPosts = req.user.likedPosts;
    const selectedBlog = req.params.id;
    const alreadyLiked = likedPosts.includes(selectedBlog);

    // post has been liked
    alreadyLiked && res.status(400).json({ message: 'Currently liked' });
    // post has not been liked
    !alreadyLiked && next();
  },
  function (req, res, next) {
    const selectedBlog = req.params.id;
    const userID = req.user.id;

    async
      .parallel([
        function incrementLikes(done) {
          // increment post likes
          Post.findByIdAndUpdate(
            selectedBlog,
            { $inc: { likes: 1 } },
            { upsert: true, new: true }
          )
            .then(() => done(null))
            .catch((error) => done(error));
        },
        function pushPost(done) {
          // add postID to user like list
          User.findByIdAndUpdate(
            userID,
            { $push: { likedPosts: selectedBlog } },
            { upsert: true, new: true }
          )
            .then(() => done(null))
            .catch((error) => done(error));
        },
      ])
      .then(() => res.status(201).json({ message: 'Post has been liked' }))
      .catch((error) => next(error));
  },
];
