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
    return res.send('not-send-name')
  } else {
    new Specialization({
      name: req.body.name,
      short: req.body.short
    }).save((err) => {
      if (err) {
        res.send('err')
        return console.error(err)
      }
      return res.send('ok')
    })
  }
}

module.exports.edit = (req, res) => {
  if (req.body.id === undefined) {
    return res.send('not-send-id')
  } if (req.body.short === undefined) {
    return res.send('not-send-short')
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
        res.send('err')
        return console.error(err)
      }
      res.send('ok')
    })
}

module.exports.delete = (req, res) => {
  if (req.body.id === undefined) {
    return res.send('not-send-id')
  } else {
    Specialization
      .deleteOne({ _id: req.body.id })
      .exec((err) => {
        if (err) {
          res.send('err')
          return console.error(err)
        }
        return res.send('ok')
      })
  }
}

module.exports.list = (req, res) => {
  Specialization
    .find({})
    .exec((err, specializations) => {
      if (err) {
        res.send(err)
        return console.error(err)
      }
      return res.status(200).json(specializations)
    })
}
