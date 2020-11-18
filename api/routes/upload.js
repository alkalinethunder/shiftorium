const mongoose = require('mongoose')

const Express = require('express')
const Upload = mongoose.model('upload')
const jwt = require('../config/jwt')
const path = require('path')
const mime = require('mime-types')
const multer = require('multer')
const { isValidObjectId } = require('mongoose')

const Utils = require('../utils')

const { ObjectId } = mongoose

const router = Express.Router()

const MAX_PERMITTED_UPLOAD_SIZE = 10485760

function validateFile(req, file, callback) {
  if (file.size > MAX_PERMITTED_UPLOAD_SIZE) {
    return callback('File is too large.', false)
  }

  if (req.body.type == 'skin') {
    if (file.mimetype != 'application/x-zip-compressed') {
      return callback('Skin uploads must be ZIP archives.', false)
    }

    callback(null, true)
  } else if (req.body.type == 'image') {
    if (!file.mimetype.startsWith('image/')) {
      return callback('Image uploads must be valid image files.', false)
    }

    callback(null, true)
  } else {
    return callback('This upload type is not supported.', false)
  }
}

const multerUpload = multer({ dest: '/uploads', fileFilter: validateFile })

router.get('/:id', async function(req, res) {
  const upload = await Upload.findOne({slug: req.params.id})

  if (upload) {
    const buffer = upload.open()
    const filename = path.basename(upload.filename)

    res.writeHeader(200, {
      'Content-Type': mime.lookup(filename),
      'Content-Length': buffer.length,
      'Content-Disposition': 'attachment;filename=' + filename
    })

    res.end(buffer)
  } else {
    res.status(404).json({
      result: null,
      errors: ['Content was not found.']
    })
  }
})

router.get('/', async function(req, res) {
  const listing = await Upload.find({})
  res.status(200).json({
    errors: [],
    result: listing
  })
})

router.post('/', jwt.authenticated, async function(req, res) {
  const uploader = multerUpload.single('file')
  uploader(req, res, async (error, success) => {
    if (!success) {
      const upload = new Upload({
        path: req.file.path,
        mimetype: req.file.mimetype,
        author: req.user,
        filename: req.file.originalname,
        size: req.file.size,
      })

      upload.generateSlug()

      await upload.save()

      await Utils.postAuditLog('uploaded a file', req.user, null, upload.slug)

      res.status(200).json({
        errors: [],
        result: upload
      })
    } else {
      res.status(400).json({
        result: null,
        errors: [error]
      })
    }
  })
})

module.exports = router
