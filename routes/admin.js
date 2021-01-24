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

/**
 * Controllers
 */
const adminPageController = require('../controllers/admin/page')
const pageController = require('../controllers/page')

/**
 * Routes
 */

/**
 * Make admin section a little bit secret
 */
router.get('/*', (req, res, next) => {
  if (req.session.user != undefined || req.session.user != null) {
    if (req.session.user.type === 'admin') {
      return next()
    }
  }
  pageController.error.notFound(req, res)
})

/**
 * Dashboard
 */
router.get('/', (req, res) => {
  res.redirect('./dashboard')
})
router.get('/dashboard', adminPageController.dashboard)

/**
 * Profile
 */
router.get('/profile', adminPageController.profile)

/**
 * TeamWorks
 */
router.get('/teamworks/', (req, res) => {
  res.redirect('./list')
})
router.get('/teamworks/list', adminPageController.teamworks.list)
router.get('/teamworks/new', adminPageController.teamworks.new)
router.get('/teamworks/edit/:id', adminPageController.teamworks.edit)

/**
 * TeamWorkTemplates
 */
router.get('/teamworktemplates/', (req, res) => {
  res.redirect('./list')
})
router.get('/teamworktemplates/list', adminPageController.teamworktemplates.list)
router.get('/teamworktemplates/new', adminPageController.teamworktemplates.new)
router.get('/teamworktemplates/edit/:id', adminPageController.teamworktemplates.edit)

/**
 * Specializations
 */
router.get('/specializations/', (req, res) => {
  res.redirect('./list')
})
router.get('/specializations/list', adminPageController.specializations.list)
router.get('/specializations/new', adminPageController.specializations.new)
router.get('/specializations/edit/:id', adminPageController.specializations.edit)

/**
 * Users
 */
router.get('/users/', (req, res) => {
  res.redirect('./list')
})
router.get('/users/list', adminPageController.users.list)
router.get('/users/new', adminPageController.users.new)
router.get('/users/import', adminPageController.users.import)
router.get('/users/edit/:id', adminPageController.users.edit)
router.get('/users/detail/:id', adminPageController.users.detail)

/**
 * Years
 */
router.get('/years/', (req, res) => {
  res.redirect('./list')
})
router.get('/years/list', adminPageController.years.list)
router.get('/years/new', adminPageController.years.new)
router.get('/years/edit/:id', adminPageController.years.edit)

/**
 * Emails
 */
router.get('/emails/', (req, res) => {
  res.redirect('./list')
})
router.get('/emails/list', adminPageController.emails.list)
router.get('/emails/:id/edit', adminPageController.emails.edit)

/**
 * Error pages (for testing)
 */
router.get('/403', adminPageController.error.accessDenied)
router.get('/404', (req, res) => { adminPageController.error.notFound(req, res) })
router.get('/500', adminPageController.error.internalError)
router.get('*', (req, res) => { adminPageController.error.notFound(req, res) })

module.exports = router
