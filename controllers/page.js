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
    return this.error.accessDenied(req, res)
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
        return this.error.internalError(req, res, err)
      } else if (user === null) {
        return this.error.notFound(req, res, 'Hledáte uživatele, který se tu nenachází, přeji Vám příjmenou hru na schovávanou.')
      } else if (!user.rescue.enabled) {
        return this.error.accessDenied(req, res)
      }
      return res.render('set-new-password', { req, res, active: 'login', title: 'Nové heslo', user })
    })
}

module.exports.error = {
  accessDenied: (req, res) => {
    return res.status(403).render('error/universal', { req, res, active: 'error', title: '403 Přístup odepřen!' })
  },
  notFound: (req, res, description = 'Hledáte soubor, který se tu nenachází, přeji Vám příjmenou hru na schovávanou.', title = '404 Nenalezeno') => {
    return res.render('error/universal', { req, res, active: 'error', title, description })
  },
  internalError: (req, res, error = 'Testovací stránka', title = '500 Vnitřní chyba serveru') => {
    return res.status(500).render('error/internalError', { req, res, active: 'error', title, error })
  }
}
