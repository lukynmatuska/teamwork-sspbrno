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
  const username = req.body.username.trim().toLowerCase()
  const email = req.body.email.trim().toLowerCase()

  User.countDocuments({}, (err, countOfUsers) => {
    if (err) {
      res.send(err)
      return console.error(err)
    }
    // First user in MongoDB will be the Guarantor (admin)
    const usertype = countOfUsers === 0 ? 'guarantor' : 'student'

    User.findOne({
      $or: [
        {
          username
        }, {
          email
        }]
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
            res.send('err-creating-user')
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
              res.send(err.message)
              return console.log('Error occurred. ' + err.message)
            }
            req.session.user = user
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
        res.send('err')
        return console.error(err)
      } else if (user === null) {
        return res.send('wrong-username')
      } else {
        bcrypt.compare(req.body.password, user.password, (err, same) => {
          if (err) {
            res.send('err')
            return console.error(err)
          } else if (!same) {
            return res.send('wrong-password')
          } else {
            req.session.user = user
            return res.send('ok')
          }
        })
      }
    })
}

module.exports.enableRescue = (req, res) => {
  if (req.body.username === undefined) {
    return res.send('not-send-username')
  } else {
    User.findOneAndUpdate({
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
    User.findById(req.body.userId)
      .exec((err, user) => {
        if (err) {
          res.send(err)
          return console.error(err)
        } else if (user.rescue || req.session.user.type === 'guarantor') {
          User.findByIdAndUpdate(
            req.body.userId,
            {
              rescue: false,
              password: bcrypt.hashSync(req.body.password, 15)
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
        } else {
          return res.status(403).send('403')
        }
      })
  }
}
