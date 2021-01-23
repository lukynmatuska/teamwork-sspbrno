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

/**
 * Controllers
 */
const errorController = require('../controllers/error')
const pageController = require('../controllers/page')
const partials = require('../routes/partials')

/**
 * Routes
 */

/* Homepage */
router.get('/', pageController.homepage)
router.get('/teamworks', pageController.teamworks.list)

/* Error pages for testing */
router.get('/403', errorController.error403)
router.get('/404', errorController.error404)
router.get('/500', errorController.error500)
router.all('/d', (req, res) => {
  req.session.destroy()
  res.redirect('/?status=destroy-ok')
})

router.get('/login', partials.onlyNonLoggedIn, pageController.login)
// router.get('/register', partials.onlyNonLoggedIn, pageController.register)
router.get('/forgot-password', partials.onlyNonLoggedIn, pageController.forgotPassword)
router.get('/forgot-password/:hash', partials.onlyNonLoggedIn, pageController.setNewPassword)
router.get('/profile', partials.onlyLoggedIn, pageController.profile)
router.get('/logout', partials.onlyLoggedIn, (req, res) => {
  req.session.destroy()
  res.cookie('toast-logout', 'true', { maxAge: 60000, httpOnly: false })
  res.redirect('/login')
})

router.get('*', errorController.error404)

module.exports = router
