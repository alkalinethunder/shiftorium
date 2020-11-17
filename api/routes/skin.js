const mongoose = require('mongoose')

const Express = require('express')
const User = mongoose.model('user')
const Upload = mongoose.model('upload')
const Skin = mongoose.model('skin')
const jwt = require('../config/jwt')

const router = Express.Router()

router.get('/', async function(req, res) {
  const skins = await Skin.find({})
  res.status(200).json({
    result: skins,
    errors: []
  })
})

router.post('/', jwt.authenticated, async function (req, res) {
  const {name, description, upload} = req.body
  const uploadRecord = await Upload.findOne({ ...upload })

  if (!uploadRecord) {
    return res.status(400).json({
      result: null,
      errors: ['An upload object must be submitted along with the skin data.', 'Try uploading the skin ZIP file to /api/upload and include the JSON result of that upload in this endpoint body.'],
    })
  }

  const userRecord = await User.findById(req.user._id)
  const existingSkin = await Skin.findOne({ author: userRecord, name })

  if (existingSkin) {
    return res.status(400).json({
      result: [],
      errors: ['A skin with this name by this user already exists.'],
    })
  }

  const skin = new Skin({
    name,
    description,
    download: uploadRecord,
    author: userRecord,
    publishDate: Date.now(),
  })

  skin.generateSlug()

  await skin.save()

  res.status(200).json({
    result: skin,
    errors: []
  })
})

router.get('/:id', async function(req, res) {
  const skin = await Skin.findOne({slug: req.params.id})
    .populate('author')
    .populate('download')

  if (skin) {
    res.status(200).json({
      errors: [],
      result: skin
    })
  } else {
    res.status(404).json({
      result: null,
      errors: ['Skin not found.']
    })
  }
})

module.exports = router
