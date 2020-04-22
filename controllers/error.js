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
  if (req.originalUrl.includes('/api/')) {
    return res.status(403).send('403')
  }
  return res.status(403).render('error/accessDenied', { req, res })
}

module.exports.error404 = (req, res) => {
  return res.status(404).render('error/notFound', { req, res })
}
module.exports.error500 = (req, res) => {
  return res.status(500).render('error/internalError', { req, res, active: 'error', error: 'Testovací stránka' })
}
