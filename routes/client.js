const express = require('express');
const client = express.Router();
import { serveClient } from '../controllers/clientController';

/* GET home page. */
client.get('/', serveClient);

module.exports = client;
