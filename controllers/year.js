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
const mongoose = require('mongoose')
const userController = require('./user')
const partials = require('../routes/partials')

/**
 * Models
 */
const Year = require('../models/Year')
const User = require('../models/User')

module.exports.new = (req, res) => {
  if (req.body.name === undefined) {
    return res.send('not-send-name')
  }
  new Year({
    name: req.body.name,
    // author: (req.session.user ? req.session.user._id : null),
    description: req.body.description,
    created: moment()
  }).save((err, year) => {
    if (err) {
      return console.error(err)
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
          return console.error(err)
        }
        req.session.user = user
        res.status(200).send('ok')
      })
  })
}

module.exports.delete = (req, res) => {
  if (req.body.id === undefined) {
    return res.send('not-send-year-id')
  }
  Year
    .findByIdAndRemove(req.body.id, (err, year) => {
      if (err) {
        return console.error(err)
      }

      User
        .updateMany({
          years: {
            $in: mongoose.Types.ObjectId(year._id)
          }
        }, {
          $pull: {
            years: mongoose.Types.ObjectId(year._id)
          }
        })
        .exec((err) => {
          if (err) {
            res.send('err-update-users-when-deleting-year')
            return console.error(err)
          }
          userController.updateSession(req, res)
        })
    })
}

module.exports.edit = (req, res) => {
  let update
  if (req.body.id === undefined) {
    return res.send('not-send-year-id')
  } else if (req.body.name !== undefined) {
    update.name = req.body.name
  } else if (req.body.description !== undefined) {
    update.description = req.body.description
  } else if (req.body.status !== undefined) {
    if (!Year.schema.path('status').enumValues.includes(req.body.status)) {
      return res.send('invalid-status')
    } else {
      update.status = req.body.status
    }
  }
  Year
    .findByIdAndUpdate(req.body.id, update, { new: true })
    // .populate('author')
    .exec((err, year) => {
      if (err) {
        res.send('err')
        return console.error(err)
      }
      if (year.status === 'active') {
        req.session.year = year
      }
      res.status(200).send('ok')
    })
}

module.exports.changeStatus = (req, res) => {
  // Change status of the year
  if (req.body.id === undefined) {
    return res.send('not-sent-id')
  } else if (req.body.status === undefined) {
    return res.send('not-sent-status')
  } else if (!Year.schema.path('status').enumValues.includes(req.body.status)) {
    return res.send('invalid-status')
  }

  Year.findByIdAndUpdate(req.body.id, {
    status: req.body.status
  }, (err) => {
    if (err) {
      console.error(err)
    }
    return res.send('ok')
  })
}

module.exports.switch = (req, res) => {
  // This method switches the current (editing) year for user
  if (req.body.id === undefined) {
    return res.send('not-sent-id')
  }
  User
    .findById(req.session.user._id)
    .populate('years.year')
    .exec((err, user) => {
      if (err) {
        return console.error(err)
      }
      Year.findById(req.body.id, (err, year) => {
        if (err) {
          return console.error(err)
        }
        if (year === null) {
          return res.send('not-found-year-bad-id')
        } else if (!partials.hasUserGivenYear(user, year)) {
          return res.send('not-permissions-for-this-year')
        } else {
          req.session.year = year
          res.send('ok')
        }
      })
    })
}

module.exports.list = (req, res) => {
  Year
    .find({})
    // .populate('author')
    .exec((err, years) => {
      if (err) {
        res.send('err')
        return console.error(err)
      }
      res.json(years)
    })
}
