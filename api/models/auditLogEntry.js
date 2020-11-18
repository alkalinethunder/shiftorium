const mongoose = require('mongoose')

const { Schema } = mongoose

const AuditLogEntrySchema = new Schema({
  action: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now() },
  message: { type: String, required: false },
  instigator: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
  recipient: { type: Schema.Types.ObjectId, required: false, ref: 'user' }
})

module.exports = mongoose.model('auditLog', AuditLogEntrySchema)
