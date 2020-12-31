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
  if (req.body.short === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-short'
      })
  }
  new Specialization({
    name: req.body.name,
    short: req.body.short
  }).save((err, specialization) => {
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
      .json(specialization)
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
  }
  let update = {}
  if (req.body.short !== undefined) {
    update.short = req.body.short
  }
  if (req.body.name !== undefined) {
    update.name = req.body.name
  }
  Specialization
    .findByIdAndUpdate(req.body.id, update)
    .exec((err, specialization) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: err
          })
      }
      if (req.method === 'PUT') {
        return res
          .status(200)
          .json(specialization)
      }
      return res
        .status(200)
        .json({
          status: 'ok'
        })
    })
}

module.exports.delete = async (req, res) => {
  let id = req.body.id
  if (req.method === 'DELETE') {
    id = req.params.id
  }
  if (id === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-id'
      })
  }
  Specialization
    .findByIdAndRemove(id)
    .exec((err, specialization) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: err
          })
      }
      if (req.method === 'DELETE') {
        return res
          .status(200)
          .json(specialization)
      }
      return res
        .status(200)
        .json({
          status: 'ok'
        })
    })
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
      res.header("x-total-count", specializations.length)
      res.header('Access-Control-Expose-Headers', 'X-Total-Count')
      res.header('Access-Control-Expose-Headers', 'Content-Range')
      res.header('Content-Range', `specializations 0-1/${specializations.length}`)
      return res
        .status(200)
        .json(specializations)
    })
}

module.exports.findById = (req, res) => {
  if (!req.params.id) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-id'
      })
  }
  Specialization
    .findOne({ _id: req.params.id })
    .exec((err, specialization) => {
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
        .json(specialization)
    })
}