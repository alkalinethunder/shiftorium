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
    screenshots: [{type: Schema.Types.ObjectId, required: true, ref: 'upload'}]
})

SkinSchema.methods.generateSlug = function() {
  const randomSection = crypto.randomBytes(6).toString('base64')
  this.slug = slugify(randomSection + ' ' + this.name)
}

module.exports = Mongoose.model('skin', SkinSchema)
