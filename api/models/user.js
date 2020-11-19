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
    admin: { type: Boolean, required: true, default: false },
    owner: { type: Boolean, required: true, default: false },
    shadowBanned: { type: Boolean, required: true, default: false },
    suspended: { type: Boolean, required: true, default: false },
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

UserSchema.methods.canSuspend = function(admin) {
  if (this.suspended) return false
  if (this.owner) return false
  if (this.admin && !admin.owner) return false
  if (this._id == admin._id) return false
  if (this.email == 'System') return false
  return true
}

UserSchema.methods.shadowban = async function (instigator) {
  const Utils = require('../utils')

  if (instigator._id == this._id)
    throw new Error('Cannot shadowban yourself.')

  if (this.owner)
    throw new Error('Cannot shadowban a site owner')

  if (this.admin && !instigator.owner)
    throw new Error('Cannot shadowban a user as a non-siteowner.')

  if (this.email === 'System')
    throw new Error('Cannot modify the system user.')

  this.shadowBanned = !this.shadowBanned

  if (!this.shadowBanned) {
    await Utils.postAuditLog('revoked a shadow-ban', instigator, this)
  } else {
    await Utils.postAuditLog('shadow-banned a user', instigator, this)
  }

  await this.save()
}

module.exports = Mongoose.model('user', UserSchema)
