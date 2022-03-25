const path = require('path');
const mongoose = require('mongoose');
const { logger } = require(path.join(__dirname, '../config/logger.js'));

require(path.join(__dirname, '../config/database'));

(function addUser() {})();
