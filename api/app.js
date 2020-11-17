const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const app = require('express')()

require('./models/user')
require('./models/upload')
require('./models/skin')

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

app.use('/auth', require('./routes/auth'))
app.use('/upload', require('./routes/upload'))
app.use('/skin', require('./routes/skin'))

module.exports = app
