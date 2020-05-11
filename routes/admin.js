/**
 * Admin router of the app
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 * @see https://lukasmatuska.cz/
 */

/**
 * Express router API
 */
const router = require('express').Router()

/**
 * Libraries
 */
const moment = require('moment')
moment.locale('cs')

/**
 * Controllers
 */
const adminPageController = require('../controllers/admin/page')
const errorController = require('../controllers/error')
const pageController = require('../controllers/page')
const partials = require('./partials')

/**
 * Routes
 */

/**
 * Make admin section a little bit secret
 */
router.get('/*', (req, res, next) => {
  if (req.session.user !== undefined) {
    if (req.session.user.type === 'admin') {
      return next()
    }
  }
  errorController.error404(req, res)
})

/**
 * Dashboard
 */
router.get('/', (req, res) => {
  res.redirect('./dashboard')
})

router.get('/dashboard', (req, res) => {
  adminPageController.dashboard(req, res)
})

/**
 * TeamWorks
 */
router.get('/teamworks/', (req, res) => {
  res.redirect('./list')
})

router.get('/teamworks/list', (req, res) => {
  adminPageController.teamworks.list(req, res)
})

router.get('/teamworks/new', (req, res) => {
  adminPageController.teamworks.new(req, res)
})

router.get('/teamworks/edit/:id', (req, res) => {
  adminPageController.teamworks.edit(req, res)
})

router.get('/teamworks/detail/:id', (req, res) => {
  adminPageController.teamworks.detail(req, res)
})

/**
 * Profile
 */
router.get('/profile', (req, res) => {
  adminPageController.profile(req, res)
})

/**
 * Error pages for test
 */
router.get('/403', (req, res) => {
  adminPageController.error.accessDenied(req, res)
})

router.get('/404', (req, res) => {
  adminPageController.error.notFound(req, res)
})

router.get('/500', (req, res) => {
  adminPageController.error.internalError(req, res)
})

router.get('*', (req, res) => {
  adminPageController.error.notFound(req, res)
})

module.exports = router
