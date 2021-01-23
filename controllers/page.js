/**
 * Page controller
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 */

/**
 * Libs
 */

/**
 * Models
 */
const User = require('../models/User')
const TeamWork = require('../models/TeamWork')
const errorController = require('./error')

module.exports.homepage = (req, res) => {
  res.render('homepage', { req, res, active: 'home', title: '' })
}

module.exports.login = (req, res) => {
  res.render('login', { req, res, active: 'login', title: 'Přihlášení' })
}

module.exports.register = (req, res) => {
  res.render('register', { req, res, active: 'login', title: 'Registrace' })
}

module.exports.teamworks = {
  list: (req, res) => {
    res.render('teamworks/list', { req, res, active: 'teamworks', title: 'Seznam týmových prací' })
  },
}

module.exports.profile = (req, res) => {
  res.render('profile', { req, res, active: 'profile', title: 'Profil' })
}

module.exports.forgotPassword = (req, res) => {
  res.render('forgot-password', { req, res, active: 'login', title: 'Zapomenuté heslo' })
}

module.exports.setNewPassword = (req, res) => {
  if (req.params.hash === undefined) {
    return errorController.error403(req, res)
  }
  User
    .findOne({
      rescue: {
        enabled: true,
        hash: String(req.params.hash)
      }
    })
    .exec((err, user) => {
      if (err) {
        console.error(err)
        return errorController.error500(req, res, err)
      } else if (user === null) {
        return errorController.error404(req, res)
      } else if (!user.rescue.enabled) {
        return errorController.error403(req, res)
      }
      return res.render('set-new-password', { req, res, active: 'login', title: 'Nové heslo', user })
    })
}
