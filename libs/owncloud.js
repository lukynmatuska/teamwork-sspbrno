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
    oc.files.mkdir(global.CONFIG.owncloud.folder)
        .then((status) => {
            if (status == true) {
                return console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')} OwnCloud folder has been created succesfully`)
            }
            console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')} OwnCloud: '${status}'`)
        })
        .catch((error) => {
            if (error != 'The resource you tried to create already exists') {
                return console.error(`${moment().format('YYYY-MM-DD HH:mm:ss')} OwnCloud error: '${error}'`)
            }
            console.error(`${moment().format('YYYY-MM-DD HH:mm:ss')} OwnCloud folder already exist`)
        })
}).catch(error => {
    return console.error(error)
})

module.exports = oc
