/**
 * TeamWork controller
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 */

/**
 * Libs
 */
// const moment = require('moment')
// const nodemailer = require('nodemailer')

/**
 * Models
 */
const TeamWork = require('../models/TeamWork')

module.exports.new = (req, res) => {
  if (req.body.name === undefined) {
    return res.send('not-send-name')
  } else if (req.body.description === undefined) {
    return res.send('not-send-desctiption')
  } else if (req.body.students === undefined) {
    return res.send('not-send-students')
  } else if (typeof req.body.students !== 'object') {
    return res.send('not-object-students')
  } else if (req.body.guarantors === undefined) {
    return res.send('not-send-guarantors')
  } else if (typeof req.body.guarantors !== 'object') {
    return res.send('not-object-guarantors')
  } else {
    new TeamWork({
      name: req.body.name,
      description: req.body.description,
      students: req.body.students,
      guarantors: req.body.guarantors,
      year: req.session.year._id,
      author: req.session.user._id
    }).save((err) => {
      if (err) {
        res.send('err')
        return console.error(err)
      }
      return res.send('ok')
    })
  }
}

module.exports.list = (req, res) => {
  TeamWork
    .find({})
    .populate({
      path: 'students.user',
      select: 'name username email photo type'
    })
    .populate('students.position')
    .populate({
      path: 'guarantors.user',
      select: 'name username email photo type'
    })
    .populate('year')
    .populate({
      path: 'author',
      select: 'name username email photo type'
    })
    .exec((err, teamWorks) => {
      if (err) {
        res.send('err')
        return console.error(err)
      }
      return res.send(teamWorks)
    })
}
