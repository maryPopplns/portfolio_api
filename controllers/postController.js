require('dotenv').config();
const path = require('path');
const async = require('async');
const axios = require('axios');
const { check } = require('express-validator');
const { isLoggedIn, isSuperUser } = require(path.join(__dirname, './auth'));

const Post = require(path.join(__dirname, '../models/post'));
const User = require(path.join(__dirname, '../models/user'));
const Comment = require(path.join(__dirname, '../models/comment'));

exports.getPosts = function (req, res, next) {
  Post.find()
    .populate('comments')
    .lean()
    .then((posts) => res.json(posts))
    .catch(next);
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
      .catch(next);
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
      .catch(next);
  },
];

exports.deletePost = [
  isLoggedIn,
  isSuperUser,
  function getCommentIds(req, res, next) {
    Post.findById(req.params.postID)
      .then((result) => {
        req.comments = result.comments;
        next();
      })
      .catch(next);
  },
  function removePostAndComments(req, res, next) {
    async
      .parallel([
        function deletePost(cb) {
          const postID = req.params.postID;
          Post.findByIdAndDelete(postID)
            .then(() => cb())
            .catch(next);
        },
        function deleteComments(cb) {
          Comment.deleteMany({
            _id: {
              $in: req.comments,
            },
          })
            .then(() => cb())
            .catch(next);
        },
      ])
      .then(() => res.json({ message: 'post has been deleted' }))
      .catch(next);
  },
];

exports.likePost = [
  isLoggedIn,
  function preventDoubleLike(req, res, next) {
    const likedPosts = req.user.likedPosts;
    const selectedPost = req.params.postID;
    const alreadyLiked = likedPosts.includes(selectedPost);

    // post has been liked
    alreadyLiked && res.status(400).json({ message: 'Currently liked' });
    // post has not been liked
    !alreadyLiked && next();
  },
  function (req, res, next) {
    const selectedPost = req.params.postID;
    const userID = req.user.id;

    async
      .parallel([
        function incrementLikes(done) {
          // increment post likes
          Post.findByIdAndUpdate(
            selectedPost,
            { $inc: { likes: 1 } },
            { upsert: true, new: true }
          )
            .then(() => done(null))
            .catch(next);
        },
        function updateUser(done) {
          // add postID to user like list
          User.findByIdAndUpdate(
            userID,
            { $push: { likedPosts: selectedPost } },
            { upsert: true, new: true }
          )
            .then(() => done(null))
            .catch(next);
        },
      ])
      .then(() => res.json({ message: 'Post has been liked' }))
      .catch(next);
  },
];

exports.unlikePost = [
  isLoggedIn,
  function preventDoubleUnlike(req, res, next) {
    const likedPosts = req.user.likedPosts;
    const selectedPost = req.params.postID;
    const alreadyLiked = likedPosts.includes(selectedPost);

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
          // decrement post likes
          Post.findByIdAndUpdate(
            selectedPost,
            { $inc: { likes: -1 } },
            { upsert: true, new: true }
          )
            .then(() => done(null))
            .catch(next);
        },
        function pullPost(done) {
          // remove postID from likedPosts
          User.findByIdAndUpdate(
            userID,
            { $pullAll: { likedPosts: [{ _id: selectedPost }] } },
            { upsert: true, new: true }
          )
            .then(() => done(null))
            .catch(next);
        },
      ])
      .then(() => res.json({ message: 'Post has been unliked' }))
      .catch(next);
  },
];

exports.commentPost = [
  isLoggedIn,
  check('comment').trim().escape(),
  // function sentimentAnalysis(req, res, next) {
  //   const params = {
  //     PrivateKey: process.env.TEXT_2_DATA_API,
  //     DocumentText: req.body.comment,
  //   };

  //   const data = Object.keys(params)
  //     .map((key) => `${key}=${encodeURIComponent(params[key])}`)
  //     .join('&');

  //   const config = {
  //     headers: {
  //       'Content-Type': 'application/x-www-form-urlencoded',
  //     },
  //   };

  //   axios
  //     .post('http://api.text2data.com/v3/analyze', data, config)
  //     .then(({ data }) => {
  //       req.data = data;
  //       const sentiment = data.DocSentimentResultString;
  //       // lie if the post is negative
  //       sentiment === 'negative' &&
  //         res.status(201).json({ message: 'comment added to post' });
  //       sentiment !== 'negative' && next();
  //     });
  // },
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
      .catch(next);
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
            .catch(next);
        },
        function updatePost(done) {
          Post.findByIdAndUpdate(
            postID,
            { $push: { comments: commentID } },
            { upsert: true, new: true }
          )
            .then(() => {
              done(null);
            })
            .catch(next);
        },
      ])
      .then(() => {
        // send response, perform analysis on comment
        res.status(201).json({ message: 'comment added to post' });
        next();
      })
      .catch(next);
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
            .catch(next);
        },
        function updateUser(done) {
          User.findByIdAndUpdate(
            userID,
            { $pullAll: { comments: [{ _id: commentID }] } },
            { upsert: true, new: true }
          )
            .then(() => done(null))
            .catch(next);
        },
        function updatePost(done) {
          Post.findByIdAndUpdate(
            postID,
            { $pullAll: { comments: [{ _id: commentID }] } },
            { upsert: true, new: true }
          )
            .then(() => done(null))
            .catch(next);
        },
      ])
      .then(() => res.json({ message: 'comment has been deleted' }))
      .catch(next);
  },
];

exports.likePostComment = [
  isLoggedIn,
  function preventDoubleLike(req, res, next) {
    const likedComments = req.user.likedComments;
    const selectedComment = req.params.commentID;
    const alreadyLiked = likedComments.includes(selectedComment);

    // comment has been liked
    alreadyLiked && res.status(400).json({ message: 'Currently liked' });
    // comment has not been liked
    !alreadyLiked && next();
  },
  function (req, res, next) {
    const selectedComment = req.params.commentID;
    const userID = req.user._id;

    async
      .parallel([
        function incrementLikes(done) {
          // increment comment likes
          Comment.findByIdAndUpdate(
            selectedComment,
            { $inc: { likes: 1 } },
            { upsert: true, new: true }
          )
            .then(() => done(null))
            .catch(next);
        },
        function updateUser(done) {
          // add commentID to user likedComments list
          User.findByIdAndUpdate(
            userID,
            { $push: { likedComments: selectedComment } },
            { upsert: true, new: true }
          )
            .then(() => done(null))
            .catch(next);
        },
      ])
      .then(() => res.json({ message: 'Comment has been liked' }))
      .catch(next);
  },
];

exports.unlikePostComment = [
  isLoggedIn,
  function preventDoubleLike(req, res, next) {
    const likedComments = req.user.likedComments;
    const selectedComment = req.params.commentID;
    const alreadyLiked = likedComments.includes(selectedComment);

    // comment has been unliked
    !alreadyLiked && res.status(400).json({ message: 'Currently unliked' });
    // comment has not been unliked
    alreadyLiked && next();
  },
  function (req, res, next) {
    const selectedComment = req.params.commentID;
    const userID = req.user._id;

    async
      .parallel([
        function decrementLikes(done) {
          // decrement post likes
          Comment.findByIdAndUpdate(
            selectedComment,
            { $inc: { likes: -1 } },
            { upsert: true, new: true }
          )
            .then(() => done(null))
            .catch(next);
        },
        function updateUser(done) {
          // remove commentID from likedPosts
          User.findByIdAndUpdate(
            userID,
            { $pullAll: { likedComments: [{ _id: selectedComment }] } },
            { upsert: true, new: true }
          )
            .then(() => done(null))
            .catch(next);
        },
      ])
      .then(() => res.json({ message: 'Comment has been unliked' }))
      .catch(next);
  },
];
