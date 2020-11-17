const mongoose = require('mongoose')
const Express = require('express')
const User = mongoose.model('user')
const jwtMiddleware = require('../config/jwt')

const router = Express.Router();

router.get('/user', jwtMiddleware.authenticated, async function (req, res) {
    res.status(200).json({
        errors: [],
        result: req.user
    })
})

router.get('/user/:username', jwtMiddleware.authenticated, async function(req, res) {
  const { username } = req.params
  const user = await User.findOne({ username })

  if (user) {
    res.status(200).json({
      errors: [],
      result: user.toJSON()
    })
  } else {
    res.status(404).json({
      errors: ['User not found.'],
      result: null
    })
  }
})

router.post('/logout', jwtMiddleware.authenticated, async function (req, res) {
    res.status(403).json({
        errors: [ 'Endpoint requires user authentication.'],
        result: null
    })
})

router.post('/refresh', jwtMiddleware.authenticated, async function (req, res) {
    res.status(403).json({
        errors: [ 'Endpoint requires user authentication.'],
        result: null
    })
})

router.post('/login', async function (req, res) {
    const { email, password } = req.body

    if (!email) {
        res.status(400).json({
            errors: ['Email is required.'],
            result: null
        })
    } else if (!password) {
        res.status(400).json({
            errors: ['Password is required.'],
            result: null
        })
    } else {
        const user = await User.findOne({ email })
        if (user) {
            if (!user.validatePassword(password)) {
                res.status(401).json({
                    errors: ['Password is invalid.'],
                    result: null
                })
            } else {
                const signature = jwtMiddleware.sign(user)
                res.status(200).json({
                    errors: [],
                    result: {
                        token: signature,
                        user: user.toJSON()
                    }
                })
            }
        } else {
            res.status(401).json({
                errors: ['User with given email address doesn\'t exist.'],
                result: null
            })
        }
    }
})

router.post('/signup', async function (req, res) {
    const { email, username, password } = req.body

    if (!email) {
        res.status(400).json({
            errors: ['Email is required.'],
            result: null
        })
    } else if (!username) {
        res.status(400).json({
            errors: ['Username is required.'],
            result: null
        })
    } else if (!password) {
        res.status(400).json({
            errors: ['Password is required.'],
            result: null
        })
    } else {
        const existingUser = await User.findOne({ email, username })

        if (existingUser) {
            res.status(400).json({
                errors: ['Username or email address is already taken.'],
                result: null
            })
        }

        const user = new User({
            email,
            username,
            createDate: Date.now()
        })

        user.setPassword(password)

        await user.save()

        res.status(200).json({
            errors: [],
            result: user.toJSON()
        })
    }
})

module.exports = router;
