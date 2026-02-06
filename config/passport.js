const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const mobileUserModel = require('../models/mobileUser/mobileUser');
let keys = "dsfdsfdsfdsfsdfsfssfdsfsfegtgnb"
//const keys = require('./keys');

const opts = {};
opts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
opts.keys = keys;

module.exports = passport => {
    passport.use(
        new JWTStrategy(opts, (jwt_payload,done) => {
            mobileUserModel.findById(jwt_payload._id)
                .then(user => {
                    if(user){
                        return done( null, user )
                    }
                    return done( null,false );
                })
                .catch(err => {
                  //  console.log(err);
                })
        }));
};