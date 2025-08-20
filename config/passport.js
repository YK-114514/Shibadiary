const JwtStrategy = require('passport-jwt').Strategy,
ExtractJwt = require('passport-jwt').ExtractJwt;
const db = require('../database/index')

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';

module.exports=passport=>{
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        console.log('JWT Payload:', jwt_payload)
        
        db.query('select * from user where id_user=?',[jwt_payload.id_user],(err,user)=>{
            if (err) {
                return done(err, false);
            }
            if (user.length>0) {
                return done(null, user[0]);
            } else {
                return done(null, false);
                // or you could create a new account
            }
        })
       
       
    }));

}