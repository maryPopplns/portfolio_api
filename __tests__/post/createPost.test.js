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

  // generated bearer token
  let token;

  async function createUser() {
    // super user
    const username = 'spencer';
    const password = '123';
    const superUser = true;

    let salt;
    let hashedPassword;

    // create salt
    await bcrypt
      .genSalt(10)
      .then((result) => (salt = result))
      .catch((error) => logger.error(`${error}`));

    // create hashed password
    await bcrypt
      .hash(password, salt)
      .then((result) => (hashedPassword = result))
      .catch((error) => logger.error(`${error}`));

    // create/save user1
    await User.create({
      username,
      password: hashedPassword,
      superUser,
    }).catch((error) => logger.error(`${error}`));

    // get user1's bearer token
    await request(app)
      .post('/user/login')
      .type('form')
      .send({ username, password })
      .then((res) => {
        token = `Bearer ${res.body.token}`;
      });
  }

  // create user before each test
  beforeEach(createUser);

  test('able to create posts', (done) => {
    const title = 'title of the post';
    const body = 'body of the post';
    request(app)
      .post('/post/create')
      .set('Authorization', token)
      .type('form')
      .send({ title, body })
      .expect(201, done);
  });
});
