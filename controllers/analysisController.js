require('dotenv').config();
const path = require('path');
const axios = require('axios').default;
const { check } = require('express-validator');
const { isLoggedIn, isSuperUser } = require(path.join(__dirname, './auth'));
const { logger } = require(path.join(__dirname, '../config/logger'));

exports.grammar = [
  isLoggedIn,
  isSuperUser,
  check('title').trim().escape(),
  check('body').trim().escape(),
  function (req, res, next) {
    const title = req.body.title;
    const body = req.body.body;

    const baseUrl = 'https://api.textgears.com/grammar?';
    const splitBody = 'text=' + body.split(' ').join('+');
    const language = '&language=en-US';

    const config = {
      url: baseUrl + splitBody + language,
      headers: {
        Authorization: process.env.TEXT_GEARS_API,
      },
    };

    axios(config)
      .then(({ data }) => {
        res.json(data.response);
      })
      .catch((error) => next(error));
  },
];

exports.sentiment = [
  isLoggedIn,
  isSuperUser,
  check('title').trim().escape(),
  check('body').trim().escape(),
  function (req, res, next) {
    const title = req.body.title;
    const body = req.body.body;

    const params = {
      PrivateKey: process.env.TEXT_2_DATA_API,
      DocumentText: title + '.' + body,
    };
    const data = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    const config = {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data,
    };

    axios('http://api.text2data.com/v3/analyze', config)
      .then(({ data }) => {
        res.json(data);
      })
      .catch((error) => next(error));
  },
];
