const Mongoose = require('mongoose')
const slugify = require('slugify')

const { Schema } = Mongoose

const SkinSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    publishDate: { type: Date, required: true },
    author: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
    download: { type: Schema.Types.ObjectId, required: true, ref: 'upload' },
    slug: { type: String, required: true },
})

SkinSchema.methods.generateSlug = function() {
  this.slug = slugify(this.name)
}

module.exports = Mongoose.model('skin', SkinSchema)
