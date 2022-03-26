const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { logger } = require(path.join(__dirname, '../config/logger'));
const User = require(path.join(__dirname, '../models/user'));
const Post = require(path.join(__dirname, '../models/post'));
const Comment = require(path.join(__dirname, '../models/comment'));

require(path.join(__dirname, '../config/database'));
const closeConnection = () => mongoose.connection.close();

const username = 'michael';
const password = '1234';

async function createUser() {
  // generate salt
  let salt;
  await bcrypt
    .genSalt(10)
    .then((result) => (salt = result))
    .catch((error) => {
      closeConnection();
      return console.log(`error generating salt: ${error}`);
    });

  // hash password
  let hashedPassword;
  salt &&
    (await bcrypt
      .hash(password, salt)
      .then((result) => (hashedPassword = result))
      .catch((error) => {
        closeConnection();
        logger.error(`error generating hash ${error}`);
      }));

  // create user
  hashedPassword &&
    (await User.create({
      username: username,
      password: hashedPassword,
    })
      .then((result) => logger.info(result))
      .catch((error) => logger.error(`error saving user: ${error}`))
      .finally(() => {
        closeConnection();
      }));
}
// function createUser() {
//   bcrypt.genSalt(10, function (error, salt) {
//     if (error) {
//       return logger.error('generating salt error: ', error);
//     }
//     bcrypt.hash(password, salt, function (error, hash) {
//       if (error) {
//         return logger.error('generating hash error: ', error);
//       }
//       User.create({
//         username: username,
//         password: hash,
//       })
//         .then((result) => logger.info(result))
//         .catch((error) => logger.error(error))
//         .finally(() => {
//           closeConnection();
//         });
//     });
//   });
// }

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

function createComment() {
  Comment.create({
    comment: 'title',
    user: '623e5757135c58fdafb6590a',
  })
    .then((result) => logger.info(result))
    .catch((error) => logger.error(`${error}`))
    .finally(() => {
      closeConnection();
    });
}

createUser();
// createPost();
// createComment();
