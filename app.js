const path = require('path');
const logger = require('morgan');
const express = require('express');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');

const usersRouter = require(path.join(__dirname, './routes/users'));
const clientRouter = require(path.join(__dirname, './routes/client'));

const app = express();

// database connection
require(path.join(__dirname, '/config/database'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', clientRouter);
app.use('/users', usersRouter);

// 404
app.use(function (req, res, next) {
  // TODO create 404 page
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
