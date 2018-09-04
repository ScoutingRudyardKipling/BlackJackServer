var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/Group');
var TokenStrategy = require('passport-accesstoken').Strategy;

passport.use(new TokenStrategy(function (token, done) {
        User.findOne({'tokens.token': token}, function (err, user) {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false);
            }

            if (!user.verifyToken(token)) {
                return done(null, false);
            }

            user.updateTokenDate(token);
            return done(null, user);
        });
    }
));

passport.use(new LocalStrategy({
        usernameField: 'name',
        passwordField: 'password'
    }, function (name, password, done) {
        User.findOne({name: name}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {message: 'Incorrect name.'});
            }

            // validate the password
            user.validPassword(password, function success() {
                // password correct
                done(null, user);
            }, function failure() {
                // password incorrect
                done(null, false, {message: 'Incorrect password.'});
            });
        });
    }
));

module.exports = passport;