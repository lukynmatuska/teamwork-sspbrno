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

  detail: (req, res) => {
    TeamWork
      .findById(req.params.id)
      .populate({
        path: 'students.user',
        select: 'name email photo type ownCloudId'
      })
      .populate('students.position')
      .populate({
        path: 'guarantors.user',
        select: 'name email photo type ownCloudId'
      })
      .populate({
        path: 'consultants.user',
        select: 'name email photo type ownCloudId'
      })
      .populate('year')
      .populate({
        path: 'author',
        select: 'name email photo type ownCloudId'
      })
      .exec((err, teamwork) => {
        if (err) {
          console.error(err)
          return this.error.internalError(req, res, 'Mongoose error')
        } else if (teamwork == undefined) {
          return this.error.notFound(req, res)
        } else {
          return res.render('teamworks/detail', { req, res, active: 'teamworks', title: 'Detail týmové práce', teamwork })
        }
      })
  },

  edit: (req, res) => {
    TeamWork
      .findById(req.params.id)
      .populate({
        path: 'students.user',
        select: 'name email photo type ownCloudId'
      })
      .populate('students.position')
      .populate({
        path: 'guarantors.user',
        select: 'name email photo type ownCloudId'
      })
      .populate({
        path: 'consultants.user',
        select: 'name email photo type ownCloudId'
      })
      .populate('year')
      .populate({
        path: 'author',
        select: 'name email photo type ownCloudId'
      })
      .exec((err, teamwork) => {
        if (err) {
          console.error(err)
          return this.error.internalError(req, res, err)
        } else if (teamwork == null) {
          return this.error.notFound(req, res)
        } else {
          return res.render('teamworks/edit', { req, res, active: 'teamworks', title: 'Editace týmové práce', teamwork })
        }
      })
  },

  feedback: (req, res) => {
    TeamWork
      .findById(req.params.id)
      .populate({
        path: 'students.user',
        select: 'name email photo type'
      })
      .populate('students.position')
      .populate({
        path: 'guarantors.user',
        select: 'name email photo type'
      })
      .populate({
        path: 'consultants.user',
        select: 'name email photo type'
      })
      .populate('year')
      .populate({
        path: 'author',
        select: 'name email photo type'
      })
      .populate({
        path: 'feedbacks.author',
        select: 'name email photo type'
      })
      .populate({
        path: 'feedbacks.student',
        select: 'name email photo type'
      })
      .exec((err, teamwork) => {
        if (err) {
          console.error(err)
          return this.error.internalError(req, res, 'Mongoose error')
        } else if (teamwork == undefined) {
          return this.error.notFound(req, res)
        } else {
          let canFeedback = req.session.user.type === 'admin';
          if (!canFeedback) {
            for (const array of [teamwork.guarantors, teamwork.consultants]) {
              for (const position of array) {
                if (position.user._id == req.session.user._id) {
                  canFeedback = true;
                  break;
                }
              }
            }
          }
          return res.render('teamworks/feedback', { req, res, active: 'teamworks', title: 'Hodnocení týmové práce', teamwork, canFeedback })
        }
      })
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
  notFound: (req, res, description = 'Hledáte soubor, který se tu nenachází, přeji Vám příjemnou hru na schovávanou.', title = '404 Nenalezeno') => {
    return res.render('error/universal', { req, res, active: 'error', title, description })
  },
  internalError: (req, res, error = 'Testovací stránka', title = '500 Vnitřní chyba serveru') => {
    return res.status(500).render('error/internalError', { req, res, active: 'error', title, error })
  }
}
