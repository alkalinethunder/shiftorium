const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const app = require('express')()
const morgan = require('morgan')

require('./models/user')
require('./models/auditLogEntry')
require('./models/upload')
require('./models/skin')

const jwt = require('./config/jwt')

app.use(morgan('combined'))

app.use(bodyParser.json())

app.use(function(req, res, next) {
  mongoose.connect('mongodb://localhost/shiftnet', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }, (err) => {
    if (err) {
      res.status(500).json({
        errors: ['Database connection error.', err.message],
        result: null,
      })
    } else {
      next()
    }
  })
})

app.use('/admin', jwt.authenticated, jwt.adminNeeded, require('./routes/admin'))
app.use('/auth', require('./routes/auth'))
app.use('/upload', require('./routes/upload'))
app.use('/skin', require('./routes/skin'))

module.exports = app
