const Mongoose = require('mongoose')
const slugify = require('slugify')
const crypto = require('crypto')

const { Schema } = Mongoose

const SkinSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    publishDate: { type: Date, required: true },
    author: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
    download: { type: Schema.Types.ObjectId, required: true, ref: 'upload' },
    slug: { type: String, required: true },
    thumbnail: { type: Schema.Types.ObjectId, required: false, ref: 'upload' },
    screenshots: [{type: Schema.Types.ObjectId, required: true, ref: 'upload'}],
    markdown: { type: String, required: false },
})

SkinSchema.methods.generateSlug = function() {
  const randomSection = crypto.randomBytes(6).toString('base64')
  this.slug = slugify(randomSection + ' ' + this.name)
}

SkinSchema.methods.validateEdits = async function() {
  let changeSlug = true
  const skins = Mongoose.model('skin')
  const existingSkin = await skins.findOne({
    name: this.name,
    author: this.author,
  })
  if (existingSkin) {
    if (existingSkin._id.toString() != this._id.toString()) {
      throw new Error('A skin with this name already exists.')
    } else {
      changeSlug = false
    }
  }

  if (changeSlug) {
    this.generateSlug()
  }

  if (!this.description) {
    throw new Error('A description must be provided.')
  }
}

module.exports = Mongoose.model('skin', SkinSchema)
