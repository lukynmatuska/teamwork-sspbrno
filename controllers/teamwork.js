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
// const mongoose = require('mongoose')
const mongoose = require('../libs/db')

/**
 * Models
 */
const TeamWork = require('../models/TeamWork')

module.exports.new = (req, res) => {
  if (req.body.name === undefined) {
    return res.send('not-send-name')
  } else if (req.body.description === undefined) {
    return res.send('not-send-description')
  } else if (req.body.students === undefined) {
    return res.send('not-send-students')
  } else if (typeof req.body.students !== 'object') {
    return res.send('not-object-students')
  } else if (req.body.guarantors === undefined) {
    return res.send('not-send-guarantors')
  } else if (typeof req.body.guarantors !== 'object') {
    return res.send('not-object-guarantors')
  } else {
    for (let i = 0; i < req.body.students.length; i++) {
      if (typeof req.body.students[i].user !== 'string' || req.body.students[i].user === '') {
        req.body.students[i].user = undefined
      }
    }
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

module.exports.edit = (req, res) => {
  const update = {}
  if (req.body.id === undefined) {
    return res.send('not-send-id')
  }
  if (req.body.name !== undefined) {
    update.name = req.body.name
  }
  if (req.body.description !== undefined) {
    update.description = req.body.description
  }
  if (typeof req.body.students !== 'object') {
    return res.send('not-object-students')
  } else if (req.body.students !== undefined) {
    update.students = req.body.students
    for (let i = 0; i < update.students.length; i++) {
      if (typeof req.body.students[i].user !== 'string' || req.body.students[i].user === '') {
        update.students[i].user = undefined
      }
    }
  }
  if (typeof req.body.guarantors !== 'object') {
    return res.send('not-object-guarantors')
  } else if (req.body.guarantors !== undefined) {
    update.guarantors = req.body.guarantors
  }
  TeamWork
    .findByIdAndUpdate(req.body.id, update)
    .populate({
      path: 'students.user',
      select: 'name email photo type'
    })
    .populate('students.position')
    .populate({
      path: 'guarantors.user',
      select: 'name email photo type'
    })
    .populate('year')
    .populate({
      path: 'author',
      select: 'name email photo type'
    })
    .exec((err, teamWork) => {
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
  }
  TeamWork
    .findByIdAndDelete(req.body.id)
    .exec((err) => {
      if (err) {
        res.send('err')
        return console.error(err)
      }
      res.send('ok')
    })
}

module.exports.list = (req, res) => {
  let filter = {}
  if (req.query.filter !== undefined) {
    if (typeof req.query.filter === 'object') {
      filter = req.query.filter
    } else {
      return res.send('bad-type-of-filter')
    }
  }
  TeamWork
    .find(filter)
    .populate({
      path: 'students.user',
      select: 'name email photo type'
    })
    .populate('students.position')
    .populate({
      path: 'guarantors.user',
      select: 'name email photo type'
    })
    .populate('year')
    .populate({
      path: 'author',
      select: 'name email photo type'
    })
    .exec((err, teamWorks) => {
      if (err) {
        res.send('err')
        return console.error(err)
      }
      return res.send(teamWorks)
    })
}

module.exports.findById = (req, res) => {
  TeamWork
    .findById(req.params.id)
    .populate({
      path: 'students.user',
      select: 'name email photo type'
    })
    .populate('students.position')
    .populate({
      path: 'guarantors.user',
      select: 'name email photo type'
    })
    .populate('year')
    .populate({
      path: 'author',
      select: 'name email photo type'
    })
    .exec((err, teamWork) => {
      if (err) {
        res.send('err')
        return console.error(err)
      }
      return res.send(teamWork)
    })
}

module.exports.select = (req, res) => {
  /**
   * Add student to TeamWork
   */
  if (req.body.id === undefined) {
    return res.send('not-send-id')
  } else if (req.body.position === undefined) {
    return res.send('not-send-position')
  }
  TeamWork
    .findById(req.body.id)
    .populate({
      path: 'students.user',
      select: 'name email photo type'
    })
    .populate('students.position')
    .populate({
      path: 'guarantors.user',
      select: 'name email photo type'
    })
    .populate('year')
    .populate({
      path: 'author',
      select: 'name email photo type'
    })
    .exec((err, teamWork) => {
      if (err) {
        res.send('err')
        return console.error(err)
      }
      for (let i = 0; i < teamWork.students.length; i++) {
        if (String(teamWork.students[i]._id) === String(req.body.position)) {
          if (teamWork.students[i].user === undefined) {
            teamWork.students[i].user = req.session.user._id
          } else {
            return res.send('already-asigned')
          }
          break
        }
      }
      TeamWork
        .findByIdAndUpdate(req.body.id, teamWork)
        .exec((err) => {
          if (err) {
            res.send('err')
            return console.error(err)
          }
          return res.send('ok')
        })
    })
}

module.exports.hasStudentBeenAsignedToTeamWork = (req, res) => {
  if (req.session.user === undefined) {
    return res.send(true)
  } else if (req.session.user.type !== 'student') {
    return res.send(true)
  } else {
    TeamWork
      .countDocuments({
        'students.user': mongoose.Types.ObjectId(req.session.user._id)
      })
      .exec((err, countOfTeamWorkWhereStudentIs) => {
        if (err) {
          res.send('err')
          return console.error(err)
        }
        return res.send(countOfTeamWorkWhereStudentIs > 0)
      })
  }
}
