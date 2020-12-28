/**
 * Year controller
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 */

/**
 * Libs
 */
const moment = require('moment')
moment.locale('cs')
const mongoose = require('../libs/db')
const userController = require('./user')
const partials = require('../routes/partials')

/**
 * Models
 */
const Year = require('../models/Year')
const User = require('../models/User')

module.exports.new = (req, res) => {
  if (req.body.name === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-name'
      })
  }
  if (req.body.status !== undefined) {
    if (!Year.schema.path('status').enumValues.includes(req.body.status)) {
      return res
        .status(422)
        .json({
          status: 'error',
          error: 'not-send-status'
        })
    }
  }
  new Year({
    name: req.body.name,
    description: req.body.description,
    status: (req.body.status === undefined ? 'prepared' : req.body.status),
    created: moment()
  }).save((err, year) => {
    if (err) {
      console.error(err)
      return res
        .status(500)
        .json({
          status: 'error',
          error: err
        })
    }

    User.findByIdAndUpdate(
      req.session.user._id,
      {
        $push: {
          years: {
            year: year._id,
            permissions: 'edit'
          }
        }
      }, {
      new: true
    })
      .populate('years.year')
      .exec((err, user) => {
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
        return res
          .status(200)
          .json({
            status: 'ok'
          })
      })
  })
}

module.exports.delete = (req, res) => {
  if (req.body.id === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-id'
      })
  }
  Year
    .findByIdAndRemove(req.body.id, (err, year) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: err
          })
      }
      User
        .updateMany({
          'years.year': mongoose.Types.ObjectId(req.body.id)
        }, {
          $pull: {
            years: {
              year: mongoose.Types.ObjectId(req.body.id)
            }
          }
        })
        .exec((err) => {
          if (err) {
            console.error(err)
            return res
              .status(500)
              .json({
                status: 'error',
                error: err
              })
          }
          return userController.updateSession(req, res)
        })
    })
}

module.exports.edit = (req, res) => {
  const update = {}
  if (req.body.id === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-id'
      })
  }

  if (req.body.name !== undefined) {
    update.name = req.body.name
  }

  if (req.body.description !== undefined) {
    update.description = req.body.description
  }

  if (req.body.status !== undefined) {
    if (!Year.schema.path('status').enumValues.includes(req.body.status)) {
      return res
        .status(422)
        .json({
          status: 'error',
          error: 'invalid-status'
        })
    } else {
      update.status = req.body.status
    }
  }

  Year
    .findByIdAndUpdate(req.body.id, update, { new: true })
    .exec((err, year) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: err
          })
      }
      if (year.status === 'active') {
        req.session.year = year
      }
      return res
        .status(200)
        .json({
          status: 'ok'
        })
    })
}

module.exports.changeStatus = (req, res) => {
  // Change status of the year
  if (req.body.id === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-id'
      })
  } else if (req.body.status === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-status'
      })
  } else if (!Year.schema.path('status').enumValues.includes(req.body.status)) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'invalid-status'
      })
  }

  Year.findByIdAndUpdate(req.body.id, {
    status: req.body.status
  }, (err) => {
    if (err) {
      console.error(err)
      return res
        .status(500)
        .json({
          status: 'error',
          error: err
        })
    }
    return res
      .status(200)
      .json({
        status: 'ok'
      })
  })
}

module.exports.switch = (req, res) => {
  // This method switches the current (editing) year for user
  if (req.body.id === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-id'
      })
  }
  User
    .findById(req.session.user._id)
    .populate('years.year')
    .exec((err, user) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: err
          })
      }
      Year
        .findById(req.body.id)
        .exec((err, year) => {
          if (err) {
            console.error(err)
            return res
              .status(500)
              .json({
                status: 'error',
                error: err
              })
          }
          if (year === null) {
            return res
              .status(404)
              .json({
                status: 'error',
                error: 'not-found-year-bad-id'
              })
          } else if (!partials.hasUserGivenYear(user, year)) {
            return res
              .status(403)
              .json({
                status: 'error',
                error: 'not-permissions-for-this-year'
              })
          } else {
            req.session.year = year
            return res
              .status(200)
              .json({
                status: 'ok'
              })
          }
        })
    })
}

module.exports.list = (req, res) => {
  Year
    .find({})
    .exec((err, years) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: 'mongo-err'
          })
      }
      return res.json(years)
    })
}
