const owncloud = require('js-owncloud-client')
const moment = require('./moment')
const oc = new owncloud(global.CONFIG.owncloud.baseUrl)

oc.login(
    global.CONFIG.owncloud.username,
    global.CONFIG.owncloud.password,
).then(status => {
    oc.getVersion()
        .then(version => {
            console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')} Connected to OwnCloud ${version}!`)
        })
        .catch(err => {
            return console.error(err)
        })
}).catch(error => {
    return console.error(error)
})

module.exports = oc
