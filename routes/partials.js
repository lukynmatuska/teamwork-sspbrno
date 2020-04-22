/**
 * The partials methods for routers
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 * @see https://lukasmatuska.cz/
 */

/**
 * Express router API
 */
const router = require('express').Router()

/**
 * Libs
 */
const moment = require('moment')
moment.locale('cs')
const osloveni = require('../libs/osloveni')

/**
 * Controllers
 */

module.exports.setLocalVariables = (req, res, next) => {
  res.locals = {
    currentPath: req.originalUrl,
    moment,
    osloveni
  }
  next()
}
router.all('*', this.setLocalVariables)

/**
 * Export the router
 */
module.exports.router = router
