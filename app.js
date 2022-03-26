const path = require('path');
const logger = require('morgan');
const express = require('express');
const cookieParser = require('cookie-parser');

const userRouter = require(path.join(__dirname, './routes/userRoute'));

const app = express();

// database connection
require(path.join(__dirname, '/config/database'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// passport config
require(path.join(__dirname, '/config/database'));

// routes
app.use('/user', userRouter);
// remaining requests go to client
app.use(function (req, res) {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

// error handler
app.use(function (error, req, res, next) {
  res.status(error.status || 500).end(`${error}`);
});

module.exports = app;
