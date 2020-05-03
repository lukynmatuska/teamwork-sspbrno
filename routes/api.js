/**
 * The API router of the app
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
const userController = require('../controllers/user')

/**
 * Routes
 */

// Home
router.get('/', (req, res) => {
  res.status(200).send('hello world!')
})

/**
 * Error pages for test
 */
router.get('/403', (req, res) => {
  res.status(403).send('403')
})

router.get('/404', (req, res) => {
  res.status(404).send('404')
})

router.get('/500', (req, res) => {
  res.status(500).send('500')
})

router.all('/d', (req, res) => {
  req.session.destroy()
  res.status(40).send('session-destroy-ok')
})

router.get('*', (req, res) => {
  res.status(404).send('404')
})

/**
 * User's login, etc.
 */
router.post('/user/new', (req, res) => {
  userController.new(req, res)
})

router.post('/user/login', (req, res) => {
  userController.login(req, res)
})

router.post('/user/forgot-password', (req, res) => {
  userController.enableRescue(req, res)
})

router.post('/user/set-new-password', (req, res) => {
  userController.setNewPassword(req, res)
})

module.exports = router
