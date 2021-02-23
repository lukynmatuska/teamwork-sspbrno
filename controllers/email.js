/**
 * Email controller
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 */

/**
 * Libs
 */
const ejs = require('ejs')
const fs = require('fs')
const nodemailer = require('nodemailer')
const moment = require('../libs/moment')
const osloveni = require('../libs/osloveni')
const pathToTemplates = `${__dirname}/../emails/`

/**
 * Variables
 */
const transporter = nodemailer.createTransport(global.CONFIG.nodemailer.settings)
// verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error(error)
  } else {
    console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')} Nodemailer: Server is ready to take our messages`)
  }
})
let ejsData = {
  osloveni
}

/**
 * Methods
 */
module.exports.filename = (id) => {
  return `${pathToTemplates + id}.json`
}

module.exports.exists = (id) => {
  return fs.existsSync(this.filename(id))
}

module.exports.read = (id, callback) => {
  return fs.readFile(this.filename(id), callback)
}

module.exports.readSync = (id) => {
  return fs.readFileSync(this.filename(id), { encoding: 'utf8' })
}

module.exports.edit = (req, res) => {
  if (req.body.id == undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        eror: 'not-send-id'
      })
  } else if (!this.exists(req.body.id)) {
    return res
      .status(422)
      .json({
        status: 'error',
        eror: 'bad-id'
      })
  } else if (req.body.subject == undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-subject'
      })
  } else if (req.body.body == undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-body'
      })
  }
  this.read(req.body.id, (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({
          status: 'error',
          error: 'err-reading-file',
          err
        })
    }
    data = JSON.parse(data)
    data.subject = req.body.subject
    data.body = req.body.body
    fs.writeFile(
      this.filename(req.body.id),
      JSON.stringify(data, null, 2),
      'utf8', (err) => {
        if (err) {
          console.error(err)
          return res
            .status(500)
            .json({
              status: 'error',
              error: 'err-saving-file',
              err
            })
        }
        return res
          .status(200)
          .json({
            status: 'ok'
          })
      }
    )
  })
}

module.exports.send = (id, user, callback) => {
  let localEjsData = ejsData
  localEjsData.user = user
  this.read(id, (err, data) => {
    if (err) {
      console.error(err)
      return callback(err)
    }
    data = JSON.parse(data)
    for (let i = 0; i < data.attachments.length; i++) {
      data.attachments[i].path = `${__dirname}/${data.attachments[i].path}`
    }
    return transporter.sendMail({
      from: global.CONFIG.nodemailer.sender,
      to: `"${user.name.full}" <${user.email}>`,
      subject: data.subject,
      text: ejs.render(data.body.text, localEjsData),
      html: ejs.render(data.body.html, localEjsData),
      attachments: data.attachments
    }, callback)
  })
}

module.exports.list = (req, res) => {
  let filenames = fs.readdirSync(pathToTemplates)
  let list = []
  for (let i = 0; i < filenames.length; i++) {
    let id = filenames[i].split(".")[0]
    if (this.exists(id)) {
      let data = JSON.parse(this.readSync(id))
      data.id = id
      list.push(data)
    }
  }
  return res
    .status(200)
    .json(list)
}
