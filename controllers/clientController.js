const path = require('path');

exports.serveClient = function (req, res, next) {
  res.sendFile(path.join(__dirname, '../public/index.html'));
};
