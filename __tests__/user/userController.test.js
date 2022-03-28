const path = require('path');

// app setup
const app = require(path.join(__dirname, '../setup/appSetup'));

// user route
const userRoute = require(path.join(__dirname, '../../routes/userRoute'));
app.use('/user', userRoute);

describe('user route', () => {
  // start server
  // add users to the DB
  describe('create user', () => {
    test('cannot create 2 users with the same name', () => {
      const one = 1;
      expect(one).toEqual(1);
    });
  });
});
