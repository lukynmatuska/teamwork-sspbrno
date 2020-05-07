/**
 * Error controller
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 */

/**
 * Libs
 */

/**
 * Models
 */

module.exports.error403 = (req, res) => {
  return res.status(403).render('error/universal', { req, res, active: 'error', title: '403 Přístup odepřen!' })
}

module.exports.error404 = (req, res) => {
  return res.status(404).render('error/universal', { req, res, active: 'error', title: '404 Nenalezeno' })
}
module.exports.error500 = (req, res, error = 'Testovací stránka') => {
  return res.status(500).render('error/internalError', { req, res, active: 'error', title: '500 Vnitřní chyba serveru', error })
}
