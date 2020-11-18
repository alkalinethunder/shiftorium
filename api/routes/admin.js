const Express = require('express')
const Utils = require('../utils')
const mongoose = require('mongoose')

const AuditLog = mongoose.model('auditLog')
const User = mongoose.model('user')

const router = Express.Router()

router.get('/logs/:page/:itemCount', async function(req, res) {
  const {page, itemCount} = req.params
  const listing = []

  const logs = await AuditLog.find({})
    .populate('instigator')
    .populate('recipient')

  const start = itemCount * page
  const end = Math.min(start + itemCount, logs.length)

  for(let i = start; i < end; i++) {
    listing.push(logs[i])
  }

  res.status(200).json({
    errors: [],
    result: listing
  })
})

router.get('/users/:page/:itemCount', async function(req, res) {
  const {page, itemCount} = req.params
  const listing = []

  const users = await User.find({})

  const start = itemCount * page
  const end = Math.min(start + itemCount, users.length)

  for(let i = start; i < end; i++) {
    listing.push(users[i])
  }

  res.status(200).json({
    errors: [],
    result: listing
  })
})


module.exports = router
