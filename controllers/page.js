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

module.exports.homepage = (req, res) => {
  res.render('homepage', { req, res, active: 'home', title: '' })
}

module.exports.login = (req, res) => {
  res.render('login', { req, res, active: 'login', title: 'Přihlášení' })
}

module.exports.register = (req, res) => {
  res.render('register', { req, res, active: 'login', title: 'Registrace' })
}

module.exports.teamworks = (req, res) => {
  res.render('teamworks', { req, res, active: 'teamworks', title: 'Seznam týmových prací' })
}

module.exports.profile = (req, res) => {
  res.render('profile', { req, res, active: 'profile', title: 'Profil' })
}
