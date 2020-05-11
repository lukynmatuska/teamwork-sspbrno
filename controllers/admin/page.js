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
const TeamWork = require('../../models/TeamWork')
const User = require('../../models/User')

module.exports.dashboard = (req, res) => {
  res.render('admin/dashboard', { req, res, active: 'dashboard', title: 'Přehled' })
}

module.exports.teamworks = {
  list: (req, res) => {
    res.render('admin/teamworks/list', { req, res, active: 'teamworks', title: 'Seznam týmových prací' })
  },
  new: (req, res) => {
    res.render('admin/teamworks/new', { req, res, active: 'teamworks', title: 'Nová týmová práce' })
  },
  edit: (req, res) => {
    res.render('admin/teamworks/edit', { req, res, active: 'teamworks', title: 'Editace týmové práce' })
  },
  detail: (req, res) => {
    TeamWork
      .findById(req.params.id)
      .populate({
        path: 'students.user',
        select: 'name username email photo type'
      })
      .populate('students.position')
      .populate({
        path: 'guarantors.user',
        select: 'name username email photo type'
      })
      .populate('year')
      .populate({
        path: 'author',
        select: 'name username email photo type'
      })
      .exec((err, teamwork) => {
        if (err) {
          this.error.internalError(req, res)
          return console.error(err)
        }
        res.render('admin/teamworks/detail', { req, res, active: 'teamworks', title: 'Detail týmové práce', teamwork })
      })
  }
}

module.exports.users = {
  list: (req, res) => {
    res.render('admin/users/list', { req, res, active: 'users', title: 'Seznam uživatelů' })
  },
  new: (req, res) => {
    res.render('admin/users/new', { req, res, active: 'users', title: 'Nový uživatel' })
  },
  edit: (req, res) => {
    User
      .findById(req.params.id)
      .populate('years.year')
      .exec((err, user) => {
        if (err) {
          this.error.internalError(req, res)
          return console.error(err)
        }
        res.render('admin/users/edit', { req, res, active: 'users', title: 'Editace uživatele', user })
      })
  }
}

module.exports.profile = (req, res) => {
  res.render('admin/profile', { req, res, active: 'profile', title: 'Profil' })
}

module.exports.error = {
  accessDenied: (req, res) => {
    res.render('admin/errors/403', { req, res, active: 'error', title: '403 Přístup odepřen' })
  },
  notFound: (req, res) => {
    res.render('admin/errors/404', { req, res, active: 'error', title: '404 Nenalezeno' })
  },
  internalError: (req, res) => {
    res.render('admin/errors/500', { req, res, active: 'error', title: '500 Chyba serveru' })
  }
}
