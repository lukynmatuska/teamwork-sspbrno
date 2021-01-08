/**
 * TeamWork controller
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 */

/**
 * Libs
 */
const moment = require('moment')
moment.locale('cs')
// const nodemailer = require('nodemailer')
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
  } else if (req.body.result == undefined) {
    return res.send('not-send-result')
  } else if (req.body.students === undefined) {
    return res.send('not-send-students')
  } else if (typeof req.body.students !== 'object') {
    return res.send('not-object-students')
  } else if (req.body.students.length < 2 ) {
    return res.send('few-students')
  } else if (req.body.guarantors === undefined) {
    return res.send('not-send-guarantors')
  } else if (typeof req.body.guarantors !== 'object') {
    return res.send('not-object-guarantors')
  } else if (req.body.guarantors.length < 1 ) {
    return res.send('few-guarantors')
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
      consultants: req.body.consultants,
      year: req.session.year._id,
      author: req.session.user._id,
      media: req.body.media,
      result: req.body.result,
    }).save((err) => {
      if (err) {
        res.send('err')
        return console.error(err)
      }
      return res
        .status(200)
        .json({
          status: 'ok'
        })
    })
  }
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
  
  if (req.body.number != undefined) {
    update.number = Number(req.body.number)
  }

  if (req.body.description !== undefined) {
    update.description = req.body.description
  }

  if (req.body.result !== undefined) {
    update.result = req.body.result
  }

  if (typeof req.body.students !== 'object') {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-object-students'
      })
  } else if (req.body.students !== undefined) {
    update.students = req.body.students
    if (update.students.length < 2 ) {
      return res.send('few-students')
    }
    for (let i = 0; i < update.students.length; i++) {
      if (typeof req.body.students[i].user !== 'string' || req.body.students[i].user === '') {
        update.students[i].user = undefined
      }
    }
  }

  if (typeof req.body.guarantors !== 'object') {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-object-guarantors'
      })
  } else if (req.body.guarantors !== undefined) {
    update.guarantors = req.body.guarantors
    if (update.guarantors.length < 1 ) {
      return res.send('few-guarantors')
    }
  }

  if (typeof req.body.consultants !== 'object') {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-object-consultants'
      })
  } else if (req.body.consultants !== undefined) {
    update.consultants = req.body.consultants
  }

  if (req.body.year !== undefined) {
    update.year = req.body.year
  }

  if (req.body.media !== undefined) {
    update.media = req.body.media
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
  }
  TeamWork
    .findByIdAndDelete(req.body.id)
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

module.exports.copy = (req, res) => {
  if (req.body.id === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-id'
      })
  }
  TeamWork
    .findById(req.body.id)
    .exec((err, teamWork) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: err
          })
      }
      teamWork = teamWork.toObject()
      if (req.body.year !== undefined) {
        teamWork.year = req.body.year
      }
    
      for (let i = 0; i < teamWork.students.length; i++) {
        delete teamWork.students[i]._id
        delete teamWork.students[i].user
      }
      for (let i = 0; i < teamWork.guarantors.length; i++) {
        delete teamWork.guarantors[i]._id
      }
      for (let i = 0; i < teamWork.consultants.length; i++) {
        delete teamWork.consultants[i]._id
      }
      teamWork._id = mongoose.Types.ObjectId()
      teamWork.media = {}
      teamWork.number += 1
      teamWork = new TeamWork(teamWork)
      teamWork.isNew = true
      teamWork.save((err) => {
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
    })
}

module.exports.list = (req, res) => {
  let filter = { year: req.session.year._id }
  if (req.query.filter !== undefined) {
    req.query.filter = JSON.parse(req.query.filter)
    if (typeof req.query.filter === 'object') {
      filter = req.query.filter
    } else {
      return res
        .status(422)
        .json({
          status: 'error',
          error: 'bad-type-of-filter'
        })
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
    .populate({
      path: 'consultants.user',
      select: 'name email photo type'
    })
    .populate('year')
    .populate({
      path: 'author',
      select: 'name email photo type'
    })
    .exec((err, teamWorks) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: err
          })
      }
      res.header("x-total-count", teamWorks.length)
      res.header('Access-Control-Expose-Headers', 'X-Total-Count')
      res.header('Access-Control-Expose-Headers', 'Content-Range')
      res.header('Content-Range', `teamWorks 0-1/${teamWorks.length}`)
      return res
        .status(200)
        .json(teamWorks)
    })
}

module.exports.findById = (req, res) => {
  if (req.params.id === undefined) {
    return res
      .status(422)
      .json({
        status: 'err',
        error: 'not-send-id'
      })
  }
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
    .populate({
      path: 'consultants.user',
      select: 'name email photo type'
    })
    .populate('year')
    .populate({
      path: 'author',
      select: 'name email photo type'
    })
    .exec((err, teamWork) => {
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
        .json(teamWork)
    })
}

module.exports.select = (req, res) => {
  /**
   * Add student to TeamWork
   */
  if (req.body.id === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-id'
      })
  } else if (req.body.position === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-position'
      })
  }
  if (moment().diff(moment(req.session.year.startOfSelectionOfTeamWorks)) < 0) {
    return res
      // .status(422)
      .json({
        status: 'error',
        error: 'start-of-selection-of-teamworks'
      })
  }
  if (moment().diff(moment(req.session.year.endOfSelectionOfTeamWorks)) > 0) {
    return res
      // .status(422)
      .json({
        status: 'error',
        error: 'end-of-selection-of-teamworks'
      })
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
    .populate({
      path: 'consultants.user',
      select: 'name email photo type'
    })
    .populate('year')
    .populate({
      path: 'author',
      select: 'name email photo type'
    })
    .exec((err, teamWork) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: 'mongo-err'
          })
      }
      for (let i = 0; i < teamWork.students.length; i++) {
        if (String(teamWork.students[i]._id) === String(req.body.position)) {
          if (teamWork.students[i].user === undefined) {
            teamWork.students[i].user = req.session.user._id
          } else {
            return res
              .status(422)
              .json({
                status: 'error',
                error: 'already-asigned'
              })
          }
          break
        }
      }
      TeamWork
        .findByIdAndUpdate(req.body.id, teamWork)
        .exec((err) => {
          if (err) {
            console.error(err)
            return res
              .status(500)
              .json({
                status: 'error',
                error: 'mongo-err'
              })
          }
          return res
            .status(200)
            .json({
              status: 'ok'
            })
        })
    })
}

module.exports.leave = (req, res) => {
  /**
   * Remove student from the TeamWork
   */
  if (req.body.id === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-id'
      })
  } else if (req.body.position === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-position'
      })
  }
  if (moment().diff(moment(req.session.year.endOfSelectionOfTeamWorks)) > 0) {
    return res
      // .status(422)
      .json({
        status: 'error',
        error: 'end-of-selection-of-teamworks'
      })
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
    .populate({
      path: 'consultants.user',
      select: 'name email photo type'
    })
    .populate('year')
    .populate({
      path: 'author',
      select: 'name email photo type'
    })
    .exec((err, teamWork) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: 'mongo-err'
          })
      }

      for (let i = 0; i < teamWork.students.length; i++) {
        if (String(teamWork.students[i]._id) === String(req.body.position)) {
          if (teamWork.students[i].user == undefined) {
            return res
              .status(422)
              .json({
                status: 'error',
                error: 'already-free'
              })
          }
          if (String(teamWork.students[i].user._id) === String(req.session.user._id)) {
            teamWork.students[i].user = undefined
          } else {
            return res
              .status(422)
              .json({
                status: 'error',
                error: 'already-free'
              })
          }
          break
        }
      }

      TeamWork
        .findByIdAndUpdate(req.body.id, teamWork)
        .exec((err) => {
          if (err) {
            console.error(err)
            return res
              .status(500)
              .json({
                status: 'error',
                error: 'mongo-err'
              })
          }
          return res
            .status(200)
            .json({
              status: 'ok'
            })
        })
    })
}

module.exports.hasStudentBeenAsignedToTeamWork = (req, res) => {
  if (req.session.user === undefined || req.session.user == null) {
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

module.exports.isGivenTeamworkMine = (req, res) => {
  if (req.query.id === undefined || req.query == null) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-id'
      })
  }
  if (req.session.user === undefined || req.session.user === null) {
    return res
      .status(200)
      .json({
        status: 'ok',
        data: false
      })
  }
  TeamWork
    .findOne({
      _id: req.query.id,
      'students.user': mongoose.Types.ObjectId(req.session.user._id)
    })
    .exec((err, teamWork) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: 'mongo-err'
          })
      }
      if (teamWork == undefined || teamWork == null) {
        return res
          .status(200)
          .json({
            status: 'ok',
            data: false
          })
      }

      return res
        .status(200)
        .json({
          status: 'ok',
          data: true
        })
    })
}
