const path = require('path');
const mongoose = require('mongoose');
const { logger } = require(path.join(__dirname, '../config/logger'));
const User = require(path.join(__dirname, '../models/user'));
const Post = require(path.join(__dirname, '../models/post'));

require(path.join(__dirname, '../config/database'));

(function createUser() {
  const user = new User({
    username: 'spencer',
    password: '123',
  });

  const closeConnection = () => mongoose.connection.close();

  user.save((error, result) => {
    if (error) {
      logger.error(error);
      closeConnection();
    } else {
      logger.info(result);
      closeConnection();
    }
  });
})()(function createPost() {
  const user = new User({
    username: 'spencer',
    password: '123',
  });

  const closeConnection = () => mongoose.connection.close();

  user.save((error, result) => {
    if (error) {
      logger.error(error);
      closeConnection();
    } else {
      logger.info(result);
      closeConnection();
    }
  });
})();
