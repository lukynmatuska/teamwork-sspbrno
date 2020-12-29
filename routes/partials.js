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
const mongoose = require('../libs/db')
const bcrypt = require('bcrypt')

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

module.exports.hasUserGivenYear = (user, year) => {
  if (user.years.length !== 0) {
    for (let i = 0; i < user.years.length; i++) {
      if (String(user.years[i].year._id) === String(year._id)) {
        return true
      }
    }
  }
  return false
}

module.exports.setYearForUser = (req, res, next) => {
  const Year = require('../models/Year')
  const User = require('../models/User')
  let yearFilter

  if (req.session.user !== undefined && req.session.year !== undefined) {
    if (req.session.user.type === 'admin') {
      return next()
    }
  }

  if (req.session.year === undefined || req.session.user === undefined) {
    yearFilter = {
      status: 'active'
    }
  } else if (req.session.user.years.length > 0 && !(this.hasUserGivenYear(req.session.user, req.session.year))) {
    yearFilter = {
      _id: mongoose.Types.ObjectId(req.session.user.years[req.session.user.years.length - 1].year._id)
    }
  }

  Year
    .findOne(yearFilter)
    // .populate('author')
    .exec((err, year) => {
      if (err) {
        return console.error(err)
      }

      if (year != null) {
        req.session.year = year
        // Move to the next route
        next()
      } else if (year === null) {
        Year.countDocuments((err, count) => {
          if (err) {
            console.error(err)
            return res
              .status(500)
              .json({
                status: 'error',
                error: 'mongo-err'
              })
          }
          if (count === 0) {
            new Year({
              name: moment().format('YYYY'),
              description: 'Automaticly created (first) year',
              status: 'active',
              created: moment()
            }).save((err, year) => {
              if (err) {
                console.error(err)
                return res
                  .status(500)
                  .json({
                    status: 'error',
                    error: 'mongo-err'
                  })
              }
              console.log('The first year was successfully created!')
              req.session.year = year
              new User({
                name: {
                  first: 'First',
                  middle: 'user',
                  last: 'Administrator'
                },
                years: [{
                  year: year._id,
                  permissions: 'edit'
                }],
                email: 'admin@admin.net',
                type: 'admin',
                password: bcrypt.hashSync('purkynkaIsHappy', 15)
              }).save((err, user) => {
                if (err) {
                  console.error(err)
                  return res
                    .status(500)
                    .json({
                      status: 'error',
                      error: err
                    })                  
                }
                req.session.user = user
                return next()
              })
            })
          } else {
            console.error('Year not found')
            return res
              .status(404)
              .json({
                status: 'error',
                error: 'year-not-found'
              })
          }
        })
      } else {
        console.error(`Error while setting year!\n${err}`)
        return res
          .status(500)
          .json({
            status: 'error',
            error: 'err-set-year'
          })
      }
    })
}
router.all('*', this.setYearForUser)

module.exports.onlyLoggedIn = (req, res, next) => {
  if (req.session.user === undefined) {
    if (req.originalUrl.includes('api')) {
      return res
        .status(403)
        .json({
          status: 'error',
          error: 'please-login'
        })
    } else {
      return res.redirect('/login')
    }
  } else {
    next()
  }
}

module.exports.onlyNonLoggedIn = (req, res, next) => {
  if (req.session.user === undefined) {
    next()
  } else {
    return res
      .status(200)
      .json({
        status: 'error',
        error: 'only-for-non-logged-in'
      })
  }
}

module.exports.onlyGuarantor = (req, res, next) => {
  if (req.session.user === undefined) {
    return res
      .status(403)
      .json({
        status: 'error',
        error: 'only-guarantor'
      })
  } else if (req.session.user.type === 'guarantor') {
    return next()
  } else {
    return res
      .status(403)
      .json({
        status: 'error',
        error: 'only-guarantor'
      })
  }
}

module.exports.onlyGuarantorAndAdmin = (req, res, next) => {
  if (req.session.user === undefined) {
    return res
      .status(403)
      .json({
        status: 'error',
        error: 'only-guarantor-or-admin'
      })
  } else if (req.session.user.type === 'guarantor' || req.session.user.type === 'admin') {
    return next()
  } else {
    return res
      .status(403)
      .json({
        status: 'error',
        error: 'only-guarantor-or-admin'
      })
  }
}

module.exports.onlyAdmin = (req, res, next) => {
  if (req.session.user === undefined) {
    return res
      .status(403)
      .json({
        status: 'error',
        error: 'only-admin'
      })
  } else if (req.session.user.type === 'admin') {
    next()
  } else {
    return res
      .status(403)
      .json({
        status: 'error',
        error: 'only-admin'
      })
  }
}

/**
 * Export the router
 */
module.exports.router = router
