const path = require('path');
const { logger } = require(path.join(__dirname, '../../config/logger'));

// app setup
const { app, request } = require(path.join(__dirname, '../setup/appSetup'));
// memory mongoDB setup | returns server function
const mongoDB = require(path.join(__dirname, '../setup/mongoSetup'));

// user route
const userRoute = require(path.join(__dirname, '../../routes/userRoute'));
app.use('/user', userRoute);

// user model
const User = require(path.join(__dirname, '../../models/user'));

describe('create user', () => {
  mongoDB();
  test('able to create users', (done) => {
    request(app)
      .post('/user/create')
      .type('form')
      .send({ username: 'michael', password: '123' })
      // .expect('Content-Type', /json/)
      .expect(201, done);
  });
  test('all users have unique usernames', (done) => {
    // save user to DB
    User.create({
      username: 'spencer',
      password: '123',
    }).catch((error) => logger.error('error creating setup user'));
    // create a user w/ same username
    request(app)
      .post('/user/create')
      .type('form')
      .send({ username: 'spencer', password: '123' })
      // .expect('Content-Type', /json/)
      .expect(409);

    // testing a second method of creating user twice
    request(app)
      .post('/user/create')
      .type('form')
      .send({ username: 'jack', password: '123' })
      .then(() => {
        request(app)
          .post('/user/create')
          .type('form')
          .send({ username: 'jack', password: '123' })
          .expect(409, done);
      });
  });
});
