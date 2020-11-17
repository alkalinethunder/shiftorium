const ExpressJwt = require('express-jwt')
const jwt = require('jsonwebtoken')
const secret = process.env.JWT_SECRET

module.exports.sign = function(user) {
    return jwt.sign(user.toJSON(), secret, { algorithm: 'HS256' })
}

module.exports.authenticated = function (req, res, next) {
    ExpressJwt({
        secret,
        algorithms: [ 'HS256' ]
    })(req, res, next)
}
