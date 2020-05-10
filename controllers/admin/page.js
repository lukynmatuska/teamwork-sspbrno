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
