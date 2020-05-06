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

/**
 * Models
 */
const User = require('../models/User')

module.exports.new = (req, res) => {
  if (req.body.username === undefined) {
    return res.send('not-send-username')
  } else if (req.body.password === undefined) {
    return res.send('not-send-password')
  } else if (req.body.email === undefined) {
    return res.send('not-send-email')
  }
  let usertype = 'student'
  const email = req.body.email.trim().toLowerCase()
  const username = req.body.username.trim().toLowerCase()

  User.countDocuments({}, (err, countOfUsers) => {
    if (err) {
      res.send('err-mongo-count-documents')
      return console.error(err)
    }
    // First user in MongoDB will be the Guarantor (admin)
    if (countOfUsers === 0) {
      usertype = 'guarantor'
    }

    User.findOne({
      $or: [
        {
          username
        }, {
          email
        }
      ]
    })
      .exec((err, user) => {
        if (err) {
          return console.error(err)
        }

        if (user && user.username === username) {
          // user with that username exists
          return res.send('username-exist')
        }

        if (user && user.email === email) {
          // user with that email exists
          return res.send('email-exist')
        }

        // Create new user
        new User({
          name: {
            first: req.body.firstname,
            middle: req.body.middlename,
            last: req.body.lastname
          },
          username,
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
          const text = `Dobrý den ${osloveni(user.name.first)},\n\nVáš účet v týmových pracích je připraven.`
          const message = {
            from: global.CONFIG.nodemailer.sender,
            to: `"${user.name.first}${user.name.middle !== undefined ? ` ${user.name.middle} ` : ''}${user.name.last}" <${user.email}>`,
            subject: 'Váš nový účet 👤🔑',
            text
          }

          transporter.sendMail(message, (err, info, response) => {
            if (err) {
              res.send('err-sending-email')
              return console.error('Error occurred. ' + err.message)
            }
            return res.send('ok')
          })
        })
      })
  })
}

module.exports.login = (req, res) => {
  if (req.body.username === undefined) {
    res.send('not-send-username')
  } else if (req.body.password === undefined) {
    res.send('not-send-password')
  }
  User.findOne({
    $or: [{
      username: req.body.username.trim().toLowerCase()
    }, {
      email: req.body.username.trim().toLowerCase()
    }]
  })
    .exec((err, user) => {
      if (err) {
        res.send('err-mongo-finding-user')
        return console.error(err)
      } else if (user === null) {
        return res.status(404).send('wrong-username')
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

module.exports.enableRescue = (req, res) => {
  if (req.body.username === undefined) {
    return res.send('not-send-username')
  } else {
    User
      .findOneAndUpdate({
        username: req.body.username.trim().toLowerCase()
      }, {
        rescue: true
      })
      .exec((err, user) => {
        if (err) {
          res.send('err')
          return console.error(err)
        } else if (user === null) {
          return res.send('wrong-username')
        } else {
          return res.send('ok')
        }
      })
  }
}

module.exports.setNewPassword = (req, res) => {
  if (req.body.userId === undefined) {
    return res.send('not-send-user-id')
  } else if (req.body.password === undefined) {
    return res.send('not-send-password')
  } else {
    User
      .findById(req.body.userId)
      .exec((err, user) => {
        if (err) {
          res.send(err)
          return console.error(err)
        } else if (user.rescue || req.session.user.type === 'guarantor') {
          User
            .findByIdAndUpdate(
              req.body.userId,
              {
                rescue: false,
                password: bcrypt.hashSync(req.body.password, 15)
              }, {
                new: true
              }
            )
            .exec((err, user) => {
              if (err) {
                res.send('err')
                return console.error(err)
              } else if (user === null) {
                return res.send('wrong-username')
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
    .populate('years.year')
    .select({
      username: 1,
      email: 1,
      name: 1,
      photo: 1,
      type: 1
    })
    .exec((err, users) => {
      if (err) {
        res.send('err')
        return console.error(err)
      }
      res.status(200).json(users)
    })
}
