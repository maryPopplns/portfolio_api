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

// jwt auth
const auth = require(path.join(__dirname, '../../middleware/jwtAuth.js'));
app.use(auth);

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

  const superToken =
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjYyNDA4ZjRlMzNiMmJkMzg1ZjRhZTlkZSIsInVzZXJuYW1lIjoic3BlbmNlciIsInBhc3N3b3JkIjoiJDJhJDEwJFYyZVU0MVpBa2RPY294aFFKR2FZU3VKWWtSMFpsc3E0U2htanVOVTh6a3BtRmRXZFVMQURDIiwiY29tbWVudHMiOltdLCJsaWtlZFBvc3RzIjpbXSwiY29tbWVudExpa2VzIjpbXSwiX192IjowfSwiZXhwIjoxNjQ4NjYxOTE5LCJpYXQiOjE2NDg1NzU2Mzl9.5i3VqAb2zMjVilWkIg6n-mi3A_H29Lban9L6zmlTWy4';

  // generated bearer token
  let token;

  async function createUser() {
    const username = 'spencer';
    const password = '123';
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
      .then((res) => {
        const response = res.body;
        console.log(response);
        done();
      })
      .catch((error) => done(error));
  });
});