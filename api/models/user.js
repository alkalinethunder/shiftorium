const Mongoose = require('mongoose')
const crypto = require('crypto')

const { Schema } = Mongoose

const UserSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    createDate: { type: Date, required: true },
    hash: { type: String, required: true },
    salt: { type: String, required: true },
    color: { type: String, required: false, default: 'primary'},
    firstName: { type: String, required: false, default: '' },
    lastName: { type: String, required: false, default: '' },
})

UserSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(1024).toString('hex')
    const hmac = crypto.createHmac('sha512', this.salt)
    hmac.update(password)
    this.hash = hmac.digest('hex')
}

UserSchema.methods.validatePassword = function(password) {
    const hmac = crypto.createHmac('sha512', this.salt)
    hmac.update(password)
    const test = hmac.digest('hex')
    return this.hash == test
}

module.exports = Mongoose.model('user', UserSchema)
