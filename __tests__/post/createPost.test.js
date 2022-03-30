require('dotenv').config();
const path = require('path');
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

    // create users
    await User.create({
      username: 'spencer',
      password: hashedPassword,
      superUser: true,
    }).catch((error) => logger.error(`${error}`));
    await User.create({
      username: 'michael',
      password: hashedPassword,
    }).catch((error) => logger.error(`${error}`));
  }

  beforeEach(createUsers);

  // create user before each test

  test('able to create posts', (done) => {
    const title = 'title of the post';
    const body = 'body of the post';
    request(app)
      .post('/user/login')
      .type('form')
      .send({ username: 'spencer', password: '123' })
      .then((res) => {
        request(app)
          .post('/post/create')
          .set('Authorization', `Bearer ${res.body.token}`)
          .type('form')
          .send({ title, body })
          .expect(201, done);
      });
  });
  test('user needs to be authorized', (done) => {
    const title = 'title not authorized';
    const body = 'body not authorized';
    request(app)
      .post('/post/create')
      .type('form')
      .send({ title, body })
      .expect(401, done);
  });
  test('user needs to be superUser', (done) => {
    const title = 'title needs to be superUser';
    const body = 'body needs to be superUser';
    // when I attempt to create bearer token in createUser function, I am getting undefined.
    request(app)
      .post('/user/login')
      .type('form')
      .send({ username: 'michael', password: '123' })
      .then((res) => {
        request(app)
          .post('/post/create')
          .set('Authorization', `Bearer ${res.body.token}`)
          .type('form')
          .send({ title, body })
          .expect(403, done);
      });
  });
});
