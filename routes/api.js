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
const partials = require('./partials')

/**
 * Libraries
 */
const moment = require('moment')
moment.locale('cs')

/**
 * Controllers
 */
const userController = require('../controllers/user')
const specializationController = require('../controllers/specialization')
const teamworkController = require('../controllers/teamwork')
const yearController = require('../controllers/year')

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

/**
 * Sessions
 */
router.get('/session', (req, res) => {
  res.status(200).json(req.session)
})

router.all('/session/destroy', (req, res) => {
  req.session.destroy()
  res.status(200).send('ok')
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

router.post('/user/edit', partials.onlyLoggedIn, (req, res) => {
  userController.edit(req, res)
})

router.post('/user/forgot-password', (req, res) => {
  userController.enableRescue(req, res)
})

router.post('/user/set-new-password', (req, res) => {
  userController.setNewPassword(req, res)
})

router.get('/user/update-session', partials.onlyLoggedIn, (req, res) => {
  userController.updateSession(req, res)
})

router.post('/user/change-type', partials.onlyAdmin, (req, res) => {
  userController.changeType(req, res)
})

router.get('/user/list', partials.onlyLoggedIn, (req, res) => {
  userController.list(req, res)
})

router.get('/user/logout', partials.onlyLoggedIn, (req, res) => {
  req.session.destroy()
  res.send('ok')
})

/**
 * Years
 */
router.post('/year/new', partials.onlyGuarantor, (req, res) => {
  yearController.new(req, res)
})

router.post('/year/edit', partials.onlyGuarantor, (req, res) => {
  yearController.edit(req, res)
})

router.post('/year/delete', partials.onlyGuarantor, (req, res) => {
  yearController.delete(req, res)
})

router.post('/year/change-status', partials.onlyGuarantor, (req, res) => {
  yearController.changeStatus(req, res)
})

router.post('/year/switch', partials.onlyGuarantor, (req, res) => {
  yearController.switch(req, res)
})

router.get('/year/list', partials.onlyGuarantor, (req, res) => {
  yearController.list(req, res)
})

/**
 * Specialization
 */
router.post('/specialization/new', partials.onlyGuarantor, (req, res) => {
  specializationController.new(req, res)
})

router.post('/specialization/edit', partials.onlyGuarantor, (req, res) => {
  specializationController.edit(req, res)
})

router.post('/specialization/delete', partials.onlyGuarantor, (req, res) => {
  specializationController.delete(req, res)
})

router.get('/specialization/list', partials.onlyGuarantor, (req, res) => {
  specializationController.list(req, res)
})

/**
 * TeamWork
 */
router.post('/teamwork/new', partials.onlyGuarantor, (req, res) => {
  teamworkController.new(req, res)
})

router.post('/teamwork/edit', partials.onlyGuarantor, (req, res) => {
  teamworkController.edit(req, res)
})

router.get('/teamwork/list', (req, res) => {
  teamworkController.list(req, res)
})

/**
 * Not found route
 */
router.all('*', (req, res) => {
  res.status(404).send('404')
})

module.exports = router
