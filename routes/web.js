/**
 * The entry router of the app
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
const errorController = require('../controllers/error')
const pageController = require('../controllers/page')
const partials = require('../routes/partials')

/**
 * Routes
 */

/**
 * Homepage
 */
router.get('/', (req, res) => {
  pageController.homepage(req, res)
})

/**
 * TeamWorks
 */
router.get('/teamworks', (req, res) => {
  pageController.teamworks(req, res)
})

/**
 * Error pages for test
 */
router.get('/403', (req, res) => {
  errorController.error403(req, res)
})

router.get('/404', (req, res) => {
  errorController.error404(req, res)
})

router.get('/500', (req, res) => {
  errorController.error500(req, res)
})

router.all('/d', (req, res) => {
  req.session.destroy()
  res.redirect('/?status=destroy-ok')
})

router.get('/login', (req, res) => {
  if (req.session.user === undefined) {
    return pageController.login(req, res)
  } else {
    return res.redirect('/')
  }
})

router.get('/logout', partials.onlyLoggedIn, (req, res) => {
  req.session.destroy()
  res.redirect('/login?logout=ok')
})

router.get('/register', (req, res) => {
  if (req.session.user === undefined) {
    return pageController.register(req, res)
  } else {
    return res.redirect('/')
  }
})

router.get('/profile', partials.onlyLoggedIn, (req, res) => {
  pageController.profile(req, res)
})

router.get('*', (req, res) => {
  errorController.error404(req, res)
})

module.exports = router
