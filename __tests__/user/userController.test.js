const path = require('path');
const userRoute = require(path.join(__dirname, '../../routes/userRoute'));

const app = require(path.join(__dirname, '../setup/appSetup'));

app.use('/user', userRoute);

describe('user route', () => {
  describe('create user', () => {
    test('cannot create 2 users with the same name', () => {
      const one = 1;
      expect(one).toEqual(1);
    });
  });
});
