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
    .populate('info')

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

router.post('/user/:id/shadowban', async function(req, res) {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404).json({
      errors: ['User not found.'],
      result: null,
    })
  } else {
    try {
      await user.shadowban(req.user)
      res.status(200).json({
        errors: [],
        result: user,
      })
    } catch(err) {
      res.status(400).json({
        errors: [err.message],
        result: null
      })
    }
  }
})

router.post('/user/:id/suspend', async function(req, res) {
  const user = await User.findById(req.params.id)
  const reason = req.body.reason || null

  if (!user) {
    return res.status(404).json({
      errors: ['User not found.'],
      result: null
    })
  }

  if (!user.canSuspend(req.user)) {
    return res.status(403).json({
      errors: ['Cannot suspend this user.'],
      result: null,
    })
  }

  user.suspended = true;

  await user.save()
  await Utils.postAuditLog('suspended a user', req.user, user, {
    "Reason": reason,
  })

  res.status(200).json({
    errors: [],
    result: user,
  })
})

module.exports = router
