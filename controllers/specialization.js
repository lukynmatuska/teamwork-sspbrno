/**
 * Year controller
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 */

/**
 * Libs
 */
// const moment = require('moment')
// moment.locale('cs')

/**
 * Models
 */
const Specialization = require('../models/Specialization')

module.exports.new = (req, res) => {
  if (req.body.name === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-name'
      })
  }
  new Specialization({
    name: req.body.name,
    short: req.body.short
  }).save((err) => {
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


module.exports.edit = (req, res) => {
  if (req.body.id === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-id'
      })
  } if (req.body.short === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-short'
      })
  }
  Specialization
    .findByIdAndUpdate(
      req.body.id,
      {
        name: req.body.name,
        short: req.body.short
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
      return res
        .status(200)
        .json({
          status: 'ok'
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
  } else {
    Specialization
      .deleteOne({ _id: req.body.id })
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
        return res
          .status(200)
          .json({
            status: 'ok'
          })
      })
  }
}

module.exports.list = (req, res) => {
  if (req.query.filter) {
    req.query.filter = {}
  }
  Specialization
    .find(req.query.filter)
    .exec((err, specializations) => {
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
        .json(specializations)
    })
}
