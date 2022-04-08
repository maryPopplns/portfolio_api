require('dotenv').config();
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const axios = require('axios').default;
const { logger } = require(path.join(__dirname, '../config/logger'));
const User = require(path.join(__dirname, '../models/user'));
const Post = require(path.join(__dirname, '../models/post'));
const Comment = require(path.join(__dirname, '../models/comment'));

// require(path.join(__dirname, '../config/mongodb'));
const closeConnection = () => mongoose.connection.close();

function createUser() {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync('123', salt);

  // create user
  User.insertMany([
    {
      username: 'spencer',
      password: hashedPassword,
      superUser: true,
    },
    {
      username: 'michael',
      password: hashedPassword,
    },
  ])
    .catch((error) => logger.error(`${error}`))
    .finally(() => closeConnection());
}

function createPost() {
  Post.insertMany([
    {
      title: 'title1',
      body: 'body1',
    },
    {
      title: 'title2',
      body: 'body2',
    },
  ])
    .catch((error) => logger.error(`${error}`))
    .finally(() => closeConnection());
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

// createUser();
// createPost();
// createComment();

(function grammarRequest() {
  const config = {
    url: 'https://api.textgears.com/grammar?text=sdfasdfsafsaf+fasfasdf&language=en-US',
    headers: {
      Authorization: process.env.TEXT_GEARS_API,
    },
  };

  axios(config).then(({ data }) => {
    const returned = data.response.errors;
    console.log(returned);
  });
})();

function sentimentRequest() {
  const params = {
    PrivateKey: process.env.TEXT_2_DATA_API,
    DocumentText: 'the value of the text in the document',
  };

  const data = Object.keys(params)
    .map((key) => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');

  const config = {
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data,
  };

  axios('http://api.text2data.com/v3/analyze', config).then(({ data }) => {
    // const returned = data.response.errors;
    console.log(data.Themes);
  });
}
