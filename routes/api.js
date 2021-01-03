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
  let session = req.session
  if (session.user) {
    if (session.user.password) {
      delete session.user.password
    }
  }
  res.status(200).json(session)
})

router.all('/session/destroy', (req, res) => {
  req.session.destroy()
  res.status(200).json({
    status: 'ok'
  })
})

/**
 * User's login, etc.
 */
router.get('/users', partials.onlyLoggedIn, userController.list)
router.post('/user/new', userController.new)
router.post('/user/login', userController.login)
router.post('/user/edit', partials.onlyLoggedIn, userController.edit)
router.post('/user/forgot-password', userController.enableRescue)
router.post('/user/set-new-password', userController.setNewPassword)
router.get('/user/update-session', partials.onlyLoggedIn, userController.updateSession)
router.post('/user/change-type', partials.onlyAdmin, userController.changeType)
router.post('/user/delete', partials.onlyAdmin, userController.delete)
router.get('/user/list', partials.onlyLoggedIn, userController.list)
router.post('/user/import', partials.onlyAdmin, userController.import)
router.post('/user/parse-xlsx', partials.onlyAdmin, userController.parseXlsx)
router.get('/user/is-given-specialization-mine', partials.onlyLoggedIn, userController.isGivenSpecializationMine)
router.get('/user/is-given-id-mine', userController.isGivenIdMine)

router.get('/user/logout', partials.onlyLoggedIn, (req, res) => {
  req.session.destroy()
  res.cookie('toast-logout', 'true', { maxAge: 60000, httpOnly: false })
  res.json({
    status: 'ok'
  })
})

router.get('/user/am-i-logged-in', (req, res) => {
  res.json(req.session.user !== undefined)
})

/**
 * Years
 */
router.get('/years', partials.onlyAdmin, yearController.list)
router.post('/years', partials.onlyAdmin, yearController.new)
router.get('/years/:id', yearController.findById)
router.put('/years/:id', partials.onlyAdmin, yearController.edit)
router.delete('/years/:id', partials.onlyAdmin, yearController.delete)
//
router.post('/year/new', partials.onlyAdmin, yearController.new)
router.post('/year/edit', partials.onlyAdmin, yearController.edit)
router.post('/year/delete', partials.onlyAdmin, yearController.delete)
router.post('/year/change-status', partials.onlyAdmin, yearController.changeStatus)
router.post('/year/switch', partials.onlyAdmin, yearController.switch)
router.get('/year/list', partials.onlyAdmin, yearController.list)

/**
 * Specialization
 */
router.get('/specializations', specializationController.list)
router.get('/specializations/:id', specializationController.findById)
router.put('/specializations/:id', partials.onlyAdmin, specializationController.edit)
router.delete('/specializations/:id', partials.onlyAdmin, specializationController.delete)
router.post('/specializations', partials.onlyAdmin, specializationController.new)
router.post('/specialization/new', partials.onlyAdmin, specializationController.new)
router.post('/specialization/edit', partials.onlyAdmin, specializationController.edit)
router.post('/specialization/delete', partials.onlyAdmin, specializationController.delete)
router.get('/specialization/list', specializationController.list)

/**
 * TeamWork
 */
router.get('/teamworks', teamworkController.list)
router.post('/teamwork/new', partials.onlyAdmin, teamworkController.new)
router.post('/teamwork/edit', partials.onlyAdmin, teamworkController.edit)
router.get('/teamwork/list', teamworkController.list)
router.get('/teamwork/find-by-id/:id', teamworkController.findById)
router.post('/teamwork/delete', partials.onlyAdmin, teamworkController.delete)
router.post('/teamwork/copy', partials.onlyAdmin, teamworkController.copy)
router.post('/teamwork/select', partials.onlyLoggedIn, teamworkController.select)
router.post('/teamwork/leave', partials.onlyLoggedIn, teamworkController.leave)
router.get('/teamwork/has-student-been-asigned-to-teamwork', teamworkController.hasStudentBeenAsignedToTeamWork)
router.get('/teamwork/is-given-teamwork-mine', teamworkController.isGivenTeamworkMine)

/**
 * Not found route
 */
router.all('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    error: 'not-found'
  })
})

module.exports = router
