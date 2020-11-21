const mongoose = require('mongoose')

const AuditLog = mongoose.model('auditLog')
const User = mongoose.model('user')

module.exports.postAuditLog = async function(action, instigator, recipient, info) {
  if (!instigator) {
    let system = await User.findOne({username: 'System'})

    if  (!system) {
      system = new User({
        email: 'System',
        hash: 'nologin',
        salt: 'nologin',
        username: 'System',
        color: 'error',
        createDate: Date.now(),
        // Prevents admins and site owner from deleting/modifying the user.
        owner: true,
        // Prevents anyone from ever logging in as System.  The blank password hash/salt should also
        // do that, but this will also prevent system from making API requests AT ALL. (suspended users
        // fail the jwt auth check on protected endpoints.) System is an internal account used only for audit
        // entries for actions performed by my code with no instigating user.
        suspended: true,
        // Hides system user from public user listings. Only admins can see it.
        shadowBanned: true,
      })

      await system.save()
    }

    instigator = system
  }

  const log = new AuditLog({
    info: [],
    instigator,
    recipient,
    action,
    date: Date.now()
  })

  for (const key in info) {
    await log.addInfo(key, info[key])
  }

  await log.save()
}
