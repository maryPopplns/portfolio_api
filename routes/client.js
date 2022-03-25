const path = require('path');
const express = require('express');
const client = express.Router();
const { serveClient } = require(path.join(
  __dirname,
  '../controllers/clientController'
));

/* GET home page. */
client.get('/', serveClient);

module.exports = client;
