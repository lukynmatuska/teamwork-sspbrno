/**
 * User controller
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 */

/**
 * Libs
 */
const bcrypt = require('bcrypt')
// const moment = require('moment')
const osloveni = require('../libs/osloveni')
const nodemailer = require('nodemailer')
const xlsx = require('node-xlsx').default

/**
 * Models
 */
const User = require('../models/User')

module.exports.new = (req, res) => {
  let usertype
  if (req.body.password === undefined) {
    return res.send('not-send-password')
  } else if (req.body.email === undefined) {
    return res.send('not-send-email')
  } else if (req.body.specialization === undefined) {
    return res.send('not-send-user-specialization')
  } else if (req.body.usertype === undefined) {
    usertype = 'student'
  } else if (req.body.usertype !== undefined && (req.session.user !== undefined ? (req.session.user.type === 'admin') : false)) {
    usertype = req.body.usertype
  }
  const email = req.body.email.trim().toLowerCase()

  User.countDocuments({
    type: 'admin'
  }, (err, countOfUsers) => {
    if (err) {
      res.send('err-mongo-count-documents')
      return console.error(err)
    }
    // First user in MongoDB will be the Admin
    if (countOfUsers === 0) {
      usertype = 'admin'
    }

    User.findOne({
      email
    })
      .exec((err, user) => {
        if (err) {
          return console.error(err)
        }

        if (user && user.email === email) {
          // user with that email exists
          return res.send('email-exist')
        }

        // Create new user
        new User({
          name: {
            first: (req.body.firstname !== undefined ? req.body.firstname.trim() : undefined),
            middle: (req.body.middlename !== undefined ? req.body.middlename.trim() : undefined),
            last: (req.body.lastname !== undefined ? req.body.lastname.trim() : undefined)
          },
          specialization: req.body.specialization,
          password: bcrypt.hashSync(req.body.password, 15),
          email,
          type: usertype
        }).save((err, user) => {
          if (err) {
            res.send('err-mongo-save-user')
            return console.error(err)
          }

          // Send email
          const transporter = nodemailer.createTransport(global.CONFIG.nodemailer.settings)
          const text = `Dobrý den ${osloveni(user.name.first)},\n\nVáš účet v týmových pracích je připraven.\nMůžete se přihlásit na ${global.CONFIG.url}/login\n\nS přáním hezkého dne,\nOlda Vrátník\nSprávce uživatelských účtů týmových prací`
          const message = {
            from: global.CONFIG.nodemailer.sender,
            to: `"${user.name.first}${user.name.middle !== undefined ? ` ${user.name.middle} ` : ''} ${user.name.last}" <${user.email}>`,
            subject: 'Váš nový účet 👤🔑',
            text
          }

          transporter.sendMail(message, (err, info, response) => {
            if (err) {
              res.send('err-sending-email')
              return console.error('Error occurred. ' + err.message)
            }
            if (req.session.user === undefined) {
              req.session.user = user
            }
            return res.send('ok')
          })
        })
      })
  })
}

module.exports.login = (req, res) => {
  if (req.body.password === undefined) {
    res.send('not-send-password')
  }
  User
    .findOne({
      email: req.body.email.trim().toLowerCase()
    })
    .populate('specialization')
    .populate('years.year')
    .exec((err, user) => {
      if (err) {
        res.send('err-mongo-finding-user')
        return console.error(err)
      } else if (user === null) {
        return res.send('wrong-email')
      } else {
        bcrypt.compare(req.body.password, user.password, (err, same) => {
          if (err) {
            res.send('err-bcrypt-compare')
            return console.error(err)
          } else if (!same) {
            return res.send('wrong-password')
          } else {
            req.session.user = user
            return res.status(200).send('ok')
          }
        })
      }
    })
}

module.exports.edit = (req, res) => {
  const update = {
    name: {}
  }
  let id = req.session.user._id

  if (req.body.firstname !== undefined) {
    update.name.first = req.body.firstname
  }

  if (req.body.middlename !== undefined) {
    update.name.middle = req.body.middlename
  }

  if (req.body.lastname !== undefined) {
    update.name.last = req.body.lastname
  }

  if (req.body.email !== undefined) {
    update.email = req.body.email
  }

  if (Object.keys(update.name).length === 0) {
    delete update.name
  }

  if (req.session.user.type === 'admin') {
    if (req.body.id !== undefined) {
      id = req.body.id
    }

    if (req.body.years !== undefined) {
      update.years = req.body.years
    }

    if (req.body.type !== undefined) {
      update.type = req.body.type
      if (['admin', 'guarantor'].includes(update.type)) {
        update.specialization = undefined
      }
    }

    if (req.body.specialization !== undefined) {
      update.specialization = req.body.specialization
    }
  }

  User
    .findByIdAndUpdate(id, update, { new: true })
    .populate('specialization')
    .populate('years.year')
    .exec((err, user) => {
      if (err) {
        res.send('err')
        return console.error(err)
      } else if (id === req.session.user._id) {
        req.session.user = user
      }
      res.send('ok')
    })
}

module.exports.enableRescue = (req, res) => {
  if (req.body.email === undefined) {
    return res.send('not-send-email')
  } else {
    User
      .findOneAndUpdate({
        email: req.body.email.trim().toLowerCase()
      }, {
        rescue: true
      })
      .populate('specialization')
      .populate('years.year')
      .exec((err, user) => {
        if (err) {
          res.send('err')
          return console.error(err)
        } else if (user === null) {
          return res.send('wrong-email')
        } else {
          return res.send('ok')
        }
      })
  }
}

module.exports.setNewPassword = (req, res) => {
  if (req.body.id === undefined) {
    return res.send('not-send-user-id')
  } else if (req.body.password === undefined) {
    return res.send('not-send-password')
  } else {
    User
      .findById(req.body.id)
      .exec((err, user) => {
        if (err) {
          res.send(err)
          return console.error(err)
        } else if (user.rescue || req.session.user.type === 'admin') {
          User
            .findByIdAndUpdate(
              req.body.id,
              {
                rescue: false,
                password: bcrypt.hashSync(req.body.password, 15)
              },
              {
                new: true
              }
            )
            .populate('specialization')
            .populate('years.year')
            .exec((err, user) => {
              if (err) {
                res.send('err')
                return console.error(err)
              } else if (user === null) {
                return res.send('wrong-email')
              } else {
                if (req.session.user !== undefined) {
                  if (req.session.user._id === user._id) {
                    req.session.user = user
                  }
                }
                return res.send('ok')
              }
            })
        } else {
          return res.status(403).send('403')
        }
      })
  }
}

module.exports.updateSession = (req, res) => {
  User
    .findById(req.session.user._id)
    .populate('specialization')
    .populate('years.year')
    .exec((err, user) => {
      if (err) {
        res.send('err')
        return console.error(err)
      }
      // Sort years by name
      user.years.sort((a, b) => {
        if (Number(a.year.name) > Number(b.year.name)) {
          return -1
        }
        if (Number(a.year.name) < Number(b.year.name)) {
          return 1
        }
        return 0
      })
      req.session.user = user
      res.status(200).send('ok')
    })
}

module.exports.changeType = (req, res) => {
  if (req.body.id === undefined) {
    return res.send('not-send-id')
  } else if (req.body.type === undefined) {
    return res.send('not-send-type')
  } else if (!User.schema.path('type').enumValues.includes(req.body.type)) {
    return res.send('invalid-type')
  }
  User
    .findByIdAndUpdate(req.body.id, { type: req.body.type })
    .exec((err) => {
      if (err) {
        res.send(err)
        return console.error(err)
      }
      res.status(200).send('ok')
    })
}

module.exports.list = (req, res) => {
  User
    .find({})
    .populate('specialization')
    .populate('years.year')
    .select({
      email: 1,
      name: 1,
      photo: 1,
      type: 1,
      years: 1
    })
    .exec((err, users) => {
      if (err) {
        res.send('err')
        return console.error(err)
      }
      res.status(200).json(users)
    })
}

module.exports.delete = (req, res) => {
  if (req.body.id === undefined) {
    return res.send('not-send-id')
  }
  User
    .deleteOne({
      _id: req.body.id
    })
    .exec((err) => {
      if (err) {
        res.send(err)
        return console.error(err)
      }
      res.send('ok')
    })
}

module.exports.import = (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      status: 'error',
      error: 'No files were uploaded.'
    })
  }
  const students = xlsx.parse(req.files.fileToImport.data)[0].data
  res.json({
    status: 'ok',
    error: null
  })
}
