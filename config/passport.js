require('dotenv').config();
const path = require('path');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require(path.join(__dirname, '../models/user'));

// local strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    let user;
    // query user
    await User.findOne({ username })
      .then((foundUser) => {
        foundUser
          ? (user = foundUser)
          : done(null, false, { message: 'incorrect username' });
      })
      .catch((error) => done(error));

    // compare input & stored passwords
    user &&
      (await bcrypt
        .compare(password, user.password)
        .then((passwordMatch) => {
          passwordMatch
            ? done(null, user)
            : done(null, false, { message: 'incorrect password' });
        })
        .catch((error) => done(error)));
  })
);
