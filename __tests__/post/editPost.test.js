require('dotenv').config();
const path = require('path');
const async = require('async');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { logger } = require(path.join(__dirname, '../../config/logger'));
// setups
const { app, request } = require(path.join(__dirname, '../setup/appSetup'));
const mongoDB = require(path.join(__dirname, '../setup/mongoSetup'));
require(path.join(__dirname, '../../config/passport'));
// jwt auth
const auth = require(path.join(__dirname, '../../middleware/jwtAuth.js'));
app.use(auth);
// routes
const postRoute = require(path.join(__dirname, '../../routes/postRoute'));
const userRoute = require(path.join(__dirname, '../../routes/userRoute'));
app.use('/post', postRoute);
app.use('/user', userRoute);
// user model
const User = require(path.join(__dirname, '../../models/user'));
const Post = require(path.join(__dirname, '../../models/post'));

describe('PUT /post/:id', () => {
  // initialize DB
  mongoDB();

  // objectID of post to edit
  const objectID = mongoose.Types.ObjectId();

  function createUsers() {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('123', salt);

    User.insertMany([
      {
        // super user
        username: 'spencer',
        password: hashedPassword,
        superUser: true,
      },
      {
        // non super user
        username: 'michael',
        password: hashedPassword,
      },
    ]).catch((error) => logger.error(`${error}`));

    // post
    Post.create({
      _id: objectID,
      title: 'title of the post',
      body: 'body of the post',
    }).catch((error) => logger.error(`${error}`));
  }

  beforeAll(createUsers);

  // create user before each test

  test('able to edit posts', (done) => {
    async.waterfall([
      function getToken(next) {
        request(app)
          .post('/user/login')
          .type('form')
          .send({ username: 'spencer', password: '123' })
          .then((res) => {
            next(null, res.body.token);
          });
      },
      function editPost(token) {
        const title = 'authorized';
        const body = 'authorized';
        request(app)
          .put(`/post/${objectID}`)
          .set('Authorization', `Bearer ${token}`)
          .type('form')
          .send({ title, body })
          .expect(200, done);
      },
    ]);
  });
  test('user needs to be authorized', (done) => {
    const title = 'not authorized';
    const body = 'not authorized';
    request(app)
      .put(`/post/${objectID}`)
      .type('form')
      .send({ title, body })
      .expect(401, done);
  });
  test('user needs to be superUser', (done) => {
    const title = 'not superUser';
    const body = 'not superUser';
    async.waterfall([
      function getToken(cb) {
        request(app)
          .post('/user/login')
          .type('form')
          .send({ username: 'michael', password: '123' })
          .then((res) => {
            cb(null, res.body.token);
          });
      },
      function attemptToEdit(token) {
        request(app)
          .put(`/post/${objectID}`)
          .set('Authorization', `Bearer ${token}`)
          .type('form')
          .send({ title, body })
          .expect(403, done);
      },
    ]);
  });
});
