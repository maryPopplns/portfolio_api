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

describe('PUT /post/like/:id', () => {
  // initialize DB
  mongoDB();

  async function createUsers() {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('123', salt);

    // super user
    await User.create({
      username: 'spencer',
      password: hashedPassword,
    }).catch((error) => logger.error(`${error}`));
  }

  beforeAll(createUsers);

  test.skip('user needs to be superUser', (done) => {
    expect(1).toBe(1);
    done();
  });
});
