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
const User = require(path.join(__dirname, '../models/user'));

// describe('login user', () => {
//   mongoDB();
//   test('users can login', (done) => {
//     // save user to DB
//     User.create({
//       username: 'spencer',
//       password: '123',
//     }).catch((error) => logger.error('error creating setup user'));
//     // login user
//     request(app)
//       .post('/user/login')
//       .type('form')
//       .send({ username: 'spencer', password: '123' })
//       .expect('Content-Type', /json/)
//       .expect(200d, done);
//   });
// });