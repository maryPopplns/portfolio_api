require('dotenv').config();
const path = require('path');
const axios = require('axios').default;
const { check } = require('express-validator');
const { logger } = require(path.join(__dirname, '../config/logger'));

exports.grammar = [
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
  check('title').trim().escape(),
  check('body').trim().escape(),
  function (req, res, next) {
    const title = req.body.title;
    const body = req.body.body;

    res.json({ title, body });
  },
];
