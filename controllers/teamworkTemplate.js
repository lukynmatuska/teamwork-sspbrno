/**
 * TeamWorkTemplate controller
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 */

/**
 * Libs
 */
const moment = require('moment')
moment.locale('cs')
mongoose = require('../libs/db')

/**
 * Models
 */
const TeamWorkTemplate = require('../models/TeamWorkTemplate')
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
    new TeamWorkTemplate({
      name: req.body.name,
      description: req.body.description,
      students: req.body.students,
      guarantors: req.body.guarantors,
      consultants: req.body.consultants,
      author: req.session.user._id,
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
  
  if (req.body.label != undefined) {
    update.label = Number(req.body.label)
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

  TeamWorkTemplate
    .findByIdAndUpdate(req.body.id, update)
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
  TeamWorkTemplate
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

module.exports.list = (req, res) => {
  let filter = {}
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
  TeamWorkTemplate
    .find(filter)
    .populate('students.position')
    .populate({
      path: 'guarantors.user',
      select: 'name email photo type'
    })
    .populate({
      path: 'consultants.user',
      select: 'name email photo type'
    })
    .populate({
      path: 'author',
      select: 'name email photo type'
    })
    .exec((err, teamWorkTemplates) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: err
          })
      }
      res.header("x-total-count", teamWorkTemplates.length)
      res.header('Access-Control-Expose-Headers', 'X-Total-Count')
      res.header('Access-Control-Expose-Headers', 'Content-Range')
      res.header('Content-Range', `teamWorks 0-1/${teamWorkTemplates.length}`)
      return res
        .status(200)
        .json(teamWorkTemplates)
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
  TeamWorkTemplate
    .findById(req.params.id)
    .populate('students.position')
    .populate({
      path: 'guarantors.user',
      select: 'name email photo type'
    })
    .populate({
      path: 'consultants.user',
      select: 'name email photo type'
    })
    .populate({
      path: 'author',
      select: 'name email photo type'
    })
    .exec((err, teamWorkTemplate) => {
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
        .json(teamWorkTemplate)
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
  TeamWorkTemplate
    .findById(req.body.id)
    .exec((err, teamWorkTemplate) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: err
          })
      } else if (teamWorkTemplate == null) {
        return res
          .status(404)
          .json({
            status: 'error',
            error: 'source-teamworktemplate-not-found'
          })
      }
      teamWorkTemplate = teamWorkTemplate.toObject()
    
      for (let i = 0; i < teamWorkTemplate.students.length; i++) {
        delete teamWorkTemplate.students[i]._id
      }
      for (let i = 0; i < teamWorkTemplate.guarantors.length; i++) {
        delete teamWorkTemplate.guarantors[i]._id
      }
      for (let i = 0; i < teamWorkTemplate.consultants.length; i++) {
        delete teamWorkTemplate.consultants[i]._id
      }
      teamWorkTemplate._id = mongoose.Types.ObjectId()
      teamWorkTemplate.name = `Kopie ${teamWorkTemplate.name}`
      teamWorkTemplate.label = `Kopie ${teamWorkTemplate.label}`
      teamWorkTemplate = new TeamWorkTemplate(teamWorkTemplate)
      teamWorkTemplate.isNew = true
      teamWorkTemplate.save((err) => {
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

module.exports.deployTeamwork = (req, res) => {
  if (req.body.id === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-id'
      })
  } else if (req.body.year === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-year'
      })
  }
  TeamWorkTemplate
    .findById(req.body.id)
    .exec((err, teamWorkTemplate) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: err
          })
      } else if (teamWorkTemplate == null) {
        return res
          .status(404)
          .json({
            status: 'error',
            error: 'source-teamworktemplate-not-found'
          })
      }
      teamWorkTemplate = teamWorkTemplate.toObject()
    
      for (let i = 0; i < teamWorkTemplate.students.length; i++) {
        delete teamWorkTemplate.students[i]._id
      }
      for (let i = 0; i < teamWorkTemplate.guarantors.length; i++) {
        delete teamWorkTemplate.guarantors[i]._id
      }
      for (let i = 0; i < teamWorkTemplate.consultants.length; i++) {
        delete teamWorkTemplate.consultants[i]._id
      }
      teamWorkTemplate._id = mongoose.Types.ObjectId()
      teamWorkTemplate.year = req.body.year
      teamWork = new TeamWork(teamWorkTemplate)
      teamWork.isNew = true
      teamWork.save((err, teamWork) => {
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
            status: 'ok',
            new: teamWork
          })
      })
    })
}