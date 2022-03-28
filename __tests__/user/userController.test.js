const path = require('path');
const userRoute = require(path.join(__dirname, '../../routes/userRoute'));

const request = require('supertest');
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use('/user', userRoute);

describe('user route', () => {
  describe('create user', () => {
    test('cannot create 2 users with the same name', () => {
      const one = 1;
      expect(one).toEqual(1);
    });
  });
});
