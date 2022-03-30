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

describe('create posts', () => {
  // initialize DB
  mongoDB();

  async function createUsers() {
    let salt;
    let hashedPassword;

    // create salt
    await bcrypt
      .genSalt(10)
      .then((result) => (salt = result))
      .catch((error) => logger.error(`${error}`));

    // create hashed password
    await bcrypt
      .hash('123', salt)
      .then((result) => (hashedPassword = result))
      .catch((error) => logger.error(`${error}`));

    // super user
    await User.create({
      username: 'spencer',
      password: hashedPassword,
      superUser: true,
    }).catch((error) => logger.error(`${error}`));
    // non super user
    await User.create({
      username: 'michael',
      password: hashedPassword,
    }).catch((error) => logger.error(`${error}`));
  }

  beforeAll(createUsers);

  // create user before each test

  test('POST post/create', (done) => {
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
      function createPost(token) {
        const title = 'authorized';
        const body = 'authorized';
        request(app)
          .post('/post/create')
          .set('Authorization', `Bearer ${token}`)
          .type('form')
          .send({ title, body })
          .expect(201, done);
      },
    ]);
  });
  test('user needs to be authorized', (done) => {
    const title = 'not authorized';
    const body = 'not authorized';
    request(app)
      .post('/post/create')
      .type('form')
      .send({ title, body })
      .expect(401, done);
  });
  test('user needs to be superUser', (done) => {
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
      function attemptToPost(token) {
        const title = 'not superUser';
        const body = 'not superUser';
        request(app)
          .post('/post/create')
          .set('Authorization', `Bearer ${token}`)
          .type('form')
          .send({ title, body })
          .expect(403, done);
      },
    ]);
  });
});
