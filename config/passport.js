require('dotenv').config();
const path = require('path');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;

const User = require(path.join(__dirname, '../models/user'));

// local strategy
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username })
      .then((user) => {
        // no username matching
        !user && done(null, false, { message: 'incorrect username' });

        // compare hashed passwords
        bcrypt
          .compare(password, user.password)
          .then((res) => {
            // passwords match
            res && done(null, user);
            // passwords dont match
            !res && done(null, false, { message: 'incorrect password' });
          })
          .catch((error) => done(error));
      })
      .catch((error) => done(error));
  })
);

// jwt strategy
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    function (jwtPayload, done) {
      const id = jwtPayload.data._id;
      User.findById(id)
        .then((user) => {
          if (!user) {
            done(null, false, { message: 'no user' });
          } else {
            done(null, user);
          }
        })
        .catch((error) => done(error));
    }
  )
);
