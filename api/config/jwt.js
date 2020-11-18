const mongoose = require('mongoose')
const ExpressJwt = require('express-jwt')
const jwt = require('jsonwebtoken')
const secret = process.env.JWT_SECRET
const User = mongoose.model('user')

function extractJwt(header) {
  if (header) {
    const parts = header.split(' ')
    const tokenType = parts[0]
    const token = parts[1]

    if (!tokenType) {
      return false
    }

    if (tokenType.toLowerCase() !== 'bearer') {
      return false
    }

    if (!token) {
      return false;
    }

    return token
  } else {
    return false
  }
}

module.exports.sign = function(user) {
    return jwt.sign(user.toJSON(), secret, { algorithm: 'HS256' })
}

module.exports.authenticated = async function (req, res, next) {
  try {
    const token=  extractJwt(req.headers.authorization)
    if (!token) {
      res.status(401).json({
        errors: ['You are not logged in.'],
        result: null
      })
    }

    const decoded = jwt.verify(token, secret, {
      algorithm: 'HS256',
    })

    const user = await User.findById(decoded._id)

    if (!user) {
      return res.status(401).json({
        errors: ['Invalid user token.', 'User was not found in the database.'],
        result: null
      })
    }

    if (user.suspended) {
      return res.status(403).json({
        errors: ['Your account is suspended.'],
        result: null
      })
    }

    req.user = user

    next()
  } catch (err) {
    res.status(err.status || 401).json({
      errors: ['You are not logged in.', err.message],
      result: null
    })
  }
}

module.exports.adminNeeded = async function (req, res, next) {
  // We cannot solely trust req.user as being admin if their admin value is true.
  // This is because there's a potential that the user can fabricate their token
  // (JWT secret gets leaked, etc.)
  //
  // We need to query the database directly for the user and check that instead.
  const user = await User.findById(req.user._id)

  // if the user turned up as null, we're not even authenticated.
  if (!user) {
    return res.status(401).json({
      errors: ['Access denied.', 'You are not logged in.'],
      result: null
    })
  }

  const isAdmin = user.owner || user.admin

  if (!isAdmin) {
    return res.status(403).json({
      errors: ['Access denied.', 'You are not an administrator.'],
      result: null,
    })
  }

  next()
}
