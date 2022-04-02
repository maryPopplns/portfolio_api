const path = require('path');
const logger = require('morgan');
const express = require('express');
const cookieParser = require('cookie-parser');

const miscRouter = require(path.join(__dirname, './routes/miscRoute'));
const userRoute = require(path.join(__dirname, './routes/userRoute'));
const postRoute = require(path.join(__dirname, './routes/postRoute'));
const auth = require(path.join(__dirname, './middleware/jwtAuth'));

const app = express();

// database connection
require(path.join(__dirname, '/config/mongodb'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// passport config
require(path.join(__dirname, '/config/passport'));
// jwt auth
app.use(auth);

// routes
app.use('/', miscRouter);
app.use('/user', userRoute);
app.use('/post', postRoute);

// error handler
app.use(function (error, req, res, next) {
  res.status(error.status || 500).json({ error: `${error.message}` });
});

module.exports = app;
