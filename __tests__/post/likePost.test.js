require('dotenv').config();
const path = require('path');
const async = require('async');
const bcrypt = require('bcryptjs');
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

describe('PUT /post/like/:id', () => {
  beforeAll(function () {
    // initialize DB
    mongoDB();

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('123', salt);

    Post.create({
      title: 'title',
      body: 'body',
    }).catch((error) => logger.error(`${error}`));
    User.create({
      username: 'spencer',
      password: hashedPassword,
    }).catch((error) => logger.error(`${error}`));
  });

  test('users can like posts', (done) => {
    async.waterfall([
      function getToken(cb) {
        request(app)
          .post('/user/login')
          .type('form')
          .send({ username: 'spencer', password: '123' })
          .then((res) => {
            cb(null, res.body.token);
          });
      },
      function getPostID(token, cb) {
        request(app)
          .get('/post')
          .then((res) => {
            const ID = res.body[0]._id;
            cb(null, token, ID);
          });
      },
      function likePost(token, ID) {
        request(app)
          .put(`/post/like/${ID}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(201, done);
      },
    ]);
  });
  test('users can like post once', (done) => {
    async.waterfall([
      function getToken(cb) {
        request(app)
          .post('/user/login')
          .type('form')
          .send({ username: 'spencer', password: '123' })
          .then((res) => {
            cb(null, res.body.token);
          });
      },
      function getPostID(token, cb) {
        request(app)
          .get('/post')
          .then((res) => {
            const ID = res.body[0]._id;
            cb(null, token, ID);
          });
      },
      function likePost(token, ID, cb) {
        request(app)
          .put(`/post/like/${ID}`)
          .set('Authorization', `Bearer ${token}`)
          .then(() => {
            cb(null, token, ID);
          });
      },
      function likePostAgain(token, ID) {
        request(app)
          .put(`/post/like/${ID}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(400, done);
      },
    ]);
  });
  test('users must be logged in', (done) => {
    async.waterfall([
      function getPostID(cb) {
        request(app)
          .get('/post')
          .then((res) => {
            const ID = res.body[0]._id;
            cb(null, ID);
          });
      },
      function likePost(ID) {
        request(app).put(`/post/like/${ID}`).expect(401, done);
      },
    ]);
  });
});
