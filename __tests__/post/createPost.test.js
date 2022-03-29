require('dotenv').config();
const path = require('path');
const bcrypt = require('bcryptjs');
const { logger } = require(path.join(__dirname, '../../config/logger'));

// app setup
const { app, request } = require(path.join(__dirname, '../setup/appSetup'));
// memory mongoDB setup | returns server function
const mongoDB = require(path.join(__dirname, '../setup/mongoSetup'));
// passport setup
require(path.join(__dirname, '../../config/passport'));

// user route
const postRoute = require(path.join(__dirname, '../../routes/postRoute'));
const userRoute = require(path.join(__dirname, '../../routes/userRoute'));
app.use('/post', postRoute);
app.use('/user', userRoute);

// user model
const User = require(path.join(__dirname, '../../models/user'));

describe('create posts', () => {
  // initialize DB
  mongoDB();

  const username = 'spencer';
  const password = '123';
  let token;

  async function createUser() {
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

    // create/save user
    await User.create({
      username: username,
      password: hashedPassword,
    }).catch((error) => logger.error(`${error}`));

    await request(app)
      .post('/user/login')
      .type('form')
      .send({ username, password })
      .then((res) => {
        token = res.body.token;
      });
  }

  // create user before each test
  beforeEach(createUser);

  test('able to create posts', (done) => {
    expect(1).toEqual(2);
    done();
    // const title = 'title of the post';
    // const body = 'body of the post';
    // request(app)
    //   .post('/post/create')
    //   .set('Authorization', token)
    //   .type('form')
    //   .send({ title, body })
    //   .then((res) => {
    //     const response = res.body;
    //     console.log(response);
    //     done();
    //   })
    //   .catch((error) => done(error));
  });
});
