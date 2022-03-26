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
    User.findOne({ username }, (error, user) => {
      if (error) {
        return done(error);
      }
      if (!user) {
        return done(null, false, { message: 'incorrect username' });
      }
      bcrypt.compare(password, user.password, (error, res) => {
        if (res) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'incorrect password' });
        }
      });
    });
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
