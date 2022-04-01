require('dotenv').config();
const path = require('path');
const async = require('async');
const { check } = require('express-validator');
const { isLoggedIn, isSuperUser } = require(path.join(__dirname, './auth'));

const Post = require(path.join(__dirname, '../models/post'));
const User = require(path.join(__dirname, '../models/user'));
const Comment = require(path.join(__dirname, '../models/comment'));

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
    const postID = req.params.postID;
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
    const postID = req.params.postID;

    Post.findByIdAndDelete(postID)
      .then(() => res.json({ message: 'post has been deleted' }))
      .catch((error) => next(error));
  },
];

exports.likePost = [
  isLoggedIn,
  function preventDoubleLike(req, res, next) {
    const likedPosts = req.user.likedPosts;
    const selectedBlog = req.params.postID;
    const alreadyLiked = likedPosts.includes(selectedBlog);

    // post has been liked
    alreadyLiked && res.status(400).json({ message: 'Currently liked' });
    // post has not been liked
    !alreadyLiked && next();
  },
  function (req, res, next) {
    const selectedBlog = req.params.postID;
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
        function updateUser(done) {
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

exports.unlikePost = [
  isLoggedIn,
  function preventDoubleUnlike(req, res, next) {
    const likedPosts = req.user.likedPosts;
    const selectedBlog = req.params.postID;
    const alreadyLiked = likedPosts.includes(selectedBlog);

    // post has not been liked
    !alreadyLiked && res.status(400).json({ message: 'Currently unliked' });
    // post has been liked
    alreadyLiked && next();
  },
  function (req, res, next) {
    const selectedPost = req.params.postID;
    const userID = req.user.id;

    async
      .parallel([
        function decrementLikes(done) {
          Post.findByIdAndUpdate(
            selectedPost,
            { $inc: { likes: -1 } },
            { upsert: true, new: true }
          )
            .then(() => done(null))
            .catch((error) => next(error));
        },
        function pullPost(done) {
          User.findByIdAndUpdate(
            userID,
            { $pullAll: { likedPosts: [{ _id: selectedPost }] } },
            { upsert: true, new: true }
          )
            .then(() => done(null))
            .catch((error) => next(error));
        },
      ])
      .then(() => res.status(201).json({ message: 'Post has been unliked' }))
      .catch((error) => {
        next(error);
      });
  },
];

exports.commentPost = [
  isLoggedIn,
  check('comment').trim().escape(),
  function createComment(req, res, next) {
    const userID = req.user.id;
    const postID = req.params.postID;
    const userComment = req.body.comment;

    Comment.create({
      post: postID,
      user: userID,
      comment: userComment,
    })
      .then((result) => {
        req.commentID = result.id;
        next();
      })
      .catch((error) => next(error));
  },
  function (req, res, next) {
    const userID = req.user.id;
    const postID = req.params.postID;
    const commentID = req.commentID;

    async
      .parallel([
        function updateUser(done) {
          User.findByIdAndUpdate(
            userID,
            { $push: { comments: commentID } },
            { upsert: true, new: true }
          )
            .then(() => done(null))
            .catch((error) => done(error));
        },
        function updatePost(done) {
          Post.findByIdAndUpdate(
            postID,
            { $push: { comments: commentID } },
            { upsert: true, new: true }
          )
            .then(() => done(null))
            .catch((error) => done(error));
        },
      ])
      .then(() => res.status(201).json({ message: 'comment added to post' }))
      .catch((error) => next(error));
  },
];

exports.deletePostComment = [
  isLoggedIn,
  isSuperUser,
  function (req, res, next) {
    const commentID = req.params.commentID;
    const userID = req.user.id;
    const postID = req.params.postID;

    async
      .parallel([
        function deleteComment(done) {
          Comment.findByIdAndDelete(commentID)
            .then(() => done(null))
            .catch((error) => done(error));
        },
        function updateUser(done) {
          User.findByIdAndUpdate(
            userID,
            { $pullAll: { comments: [{ _id: commentID }] } },
            { upsert: true, new: true }
          )
            .then(() => done(null))
            .catch((error) => next(error));
        },
        function updatePost(done) {
          Post.findByIdAndUpdate(
            postID,
            { $pullAll: { comments: [{ _id: commentID }] } },
            { upsert: true, new: true }
          )
            .then(() => done(null))
            .catch((error) => next(error));
        },
      ])
      .then(() => res.json({ message: 'comment has been deleted' }))
      .catch((error) => next(error));
  },
];
