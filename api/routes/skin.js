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

router.get('/page/:page/:items', async function(req, res) {
  const skins = await Skin.find({})
  const listing = []
  const { page, items } = req.params

  const itemsStart = page * items
  const itemsEnd = Math.min(itemsStart + items, skins.length)

  for (let i = itemsStart; i < itemsEnd; i++) {
    listing.push(skins[i])
  }

  res.status(200).json({
    errors: [],
    result: listing,
  })
})

router.get('/:id', async function(req, res) {
  const skin = await Skin.findOne({slug: req.params.id})
    .populate('author')
    .populate('download')
    .populate('thumbnail')
    .populate('screenshots')

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

router.post('/:id', jwt.authenticated, async function (req, res) {
  const skin = await Skin.findOne({slug: req.params.id})

  if (!skin) {
    return res.status(404).json({
      error: ['Skin not found.'],
      result: null
    })
  }

  if (skin.author != req.user._id) {
    return res.status(403).json({
      errors: ['You do not have permission to edit this skin.'],
      result: null
    })
  }
})

router.post('/:id/screenshots', jwt.authenticated, async function(req, res) {
  const upload = await Upload.findOne(req.body)

  if (!upload) {
    return res.status(400).json({
      result: null,
      errors: ['You must specify an upload object to add to the skin\'s screenshot list.']
    })
  }

  if (!upload.mimetype.startsWith('image/')) {
    return res.status(400).json({
      errors: ['Upload must be an image.'],
      result: null
    })
  }

  const skin = await Skin.findOne({ slug: req.params.id })

  if (!skin) {
    res.status(404).json({
      errors: ['Skin not found.'],
      result: null
    })
  }

  if (skin.author != req.user._id) {
    res.status(403).json({
      errors: ['You do not have permission to post screenshots to this skin.'],
      result: null
    })
  }

  skin.screenshots.push(upload)

  await skin.save()

  res.status(200).json({
    result: skin,
    errors: []
  })
})

module.exports = router
