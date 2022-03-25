const path = require('path');
const mongoose = require('mongoose');
const { logger } = require(path.join(__dirname, '../config/logger'));
const User = require(path.join(__dirname, '../models/user'));
const Post = require(path.join(__dirname, '../models/post'));

require(path.join(__dirname, '../config/database'));
const closeConnection = () => mongoose.connection.close();

function createUser() {
  User.create({
    username: 'spencer',
    password: '123',
  })
    .then((result) => logger.info(result))
    .catch((error) => logger.error(error))
    .finally(() => {
      closeConnection();
    });
}

function createPost() {
  Post.create({
    title: 'title',
    body: 'body',
  })
    .then((result) => logger.info(result))
    .catch((error) => logger.error(error))
    .finally(() => {
      closeConnection();
    });
}
createPost();
