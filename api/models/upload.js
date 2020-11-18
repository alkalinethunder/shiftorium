const mongoose = require('mongoose')
const fs = require('fs')
const crypto = require('crypto')

const { Schema } = mongoose

const UploadSchema = new Schema({
  author: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
  slug: { type: String, required: true },
  path: { type: String, required: true },
  mimetype: { type: String, required: true },
  filename: { type: String, required: true },
  size: { type: Number, required: true, default: 0 },
})

UploadSchema.methods.open = function() {
  const buffer = fs.readFileSync(this.path)
  return buffer
}

UploadSchema.methods.generateSlug = function() {
  const bytes = crypto.randomBytes(48)
  const b64 = bytes.toString('base64').replace(/\//g, '_').replace(/\+/g, '-')
  this.slug = b64
}

const model = mongoose.model('upload', UploadSchema)
module.exports = model
