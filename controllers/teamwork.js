/**
 * TeamWork controller
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 */

/**
 * Libs
 */
const moment = require('../libs/moment')
const mongoose = require('../libs/db')
const owncloudController = require('./owncloud')

/**
 * Models
 */
const TeamWork = require('../models/TeamWork')
const User = require('../models/User')

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
  } else if (req.body.students.length < 2) {
    return res.send('few-students')
  } else if (req.body.guarantors === undefined) {
    return res.send('not-send-guarantors')
  } else if (typeof req.body.guarantors !== 'object') {
    return res.send('not-object-guarantors')
  } else if (req.body.guarantors.length < 1) {
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
    })
      .save((err, teamwork) => {
        if (err) {
          console.error('error: ', err)
          return res
            .status(500)
            .json({
              status: 'error',
              error: err
            })
        }
        teamwork
          .populate({
            path: 'students.user',
            select: 'name email photo type ownCloudId'
          })
          // .populate('students.position')
          .populate({
            path: 'guarantors.user',
            select: 'name email photo type ownCloudId'
          })
          .populate({
            path: 'consultants.user',
            select: 'name email photo type ownCloudId'
          })
          .populate('year')
          /*.populate({
            path: 'author',
            select: 'name email photo type ownCloudId'
          })*/
          .execPopulate()
          .then(teamwork => {
            owncloudController.newTeamwork(req, res, teamwork)
          })
      })
  }
}

module.exports.updateBasicInfo = (req, res) => {
  if (req.body.id === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-id'
      })
  }
  const update = {}
  if (req.body.name != undefined) {
    update.name = req.body.name
  }
  if (req.body.number != undefined) {
    update.number = req.body.number
  }
  if (req.body.description != undefined) {
    update.description = req.body.description
  }
  if (req.body.result != undefined) {
    update.result = req.body.result
  }
  TeamWork
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
        .json({
          status: 'ok'
        })
    })
}

module.exports.updateAdvanced = (req, res) => {
  if (req.body.id === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-id'
      })
  }
  const update = {}
  if (req.body.year != undefined) {
    update.year = req.body.year
  }
  TeamWork
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
        .json({
          status: 'ok'
        })
    })
}

module.exports.updateMedia = (req, res) => {
  if (req.body.id === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-id'
      })
  }
  const update = {}
  if (req.body.media !== undefined) {
    update.media = req.body.media
  }
  TeamWork
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
    .exec((err, tw) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: err
          })
      }
      return owncloudController.deleteTeamWork(req, res, tw)
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
      } else if (teamWork == null) {
        return res
          .status(404)
          .json({
            status: 'error',
            error: 'source-teamwork-not-found'
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
      teamWork.save((err, tw) => {
        if (err) {
          console.error(err)
          return res
            .status(500)
            .json({
              status: 'error',
              error: err
            })
        }
        return owncloudController.newTeamwork(req, res, teamWork)
      })
    })
}

module.exports.list = (req, res) => {
  let filter = { year: req.session.year._id }
  if (req.query.filter != undefined) {
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
      select: 'name email photo type ownCloudId'
    })
    .populate('students.position')
    .populate({
      path: 'guarantors.user',
      select: 'name email photo type ownCloudId'
    })
    .populate({
      path: 'consultants.user',
      select: 'name email photo type ownCloudId'
    })
    .populate('year')
    .populate({
      path: 'author',
      select: 'name email photo type ownCloudId'
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
      select: 'name email photo type ownCloudId'
    })
    .populate('students.position')
    .populate({
      path: 'guarantors.user',
      select: 'name email photo type ownCloudId'
    })
    .populate({
      path: 'consultants.user',
      select: 'name email photo type ownCloudId'
    })
    .populate('year')
    .populate({
      path: 'author',
      select: 'name email photo type ownCloudId'
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
      select: 'name email type ownCloudId'
    })
    .populate('students.position')
    /*.populate({
      path: 'guarantors.user',
      select: 'name email type ownCloudId'
    })
    .populate({
      path: 'consultants.user',
      select: 'name email type ownCloudId'
    })
    .populate('year')
    .populate({
      path: 'author',
      select: 'name email type ownCloudId'
    })*/
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
          if (String(teamWork.students[i].position._id) != String(req.session.user.specialization._id)) {
            return res
              .status(422)
              .json({
                status: 'error',
                error: 'bad-specialization'
              })
          } else if (teamWork.students[i].user != undefined) {
            return res
              .status(422)
              .json({
                status: 'error',
                error: 'already-asigned'
              })
          }
          teamWork.students[i].user = req.session.user._id
          break
        }
      }
      owncloudController.selectTeamWork(req, res, teamWork, req.body.position)
    })
}

/*module.exports.leave = (req, res) => {
  /**
   * Remove student from the TeamWork
   * /
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
      select: 'name email type ownCloudId'
    })
    .populate('students.position')
    /*.populate({
      path: 'guarantors.user',
      select: 'name email type ownCloudId'
    })
    .populate({
      path: 'consultants.user',
      select: 'name email type ownCloudId'
    })
    .populate('year')
    .populate({
      path: 'author',
      select: 'name email type ownCloudId'
    })* /
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

      let update = {
        students: []
      };

      for (let i = 0; i < teamWork.students.length; i++) {
        if (String(teamWork.students[i]._id) != String(req.body.position)) {
          continue;
        }
        // Find position
        if (teamWork.students[i].user == undefined) {
          return res
            .status(422)
            .json({
              status: 'error',
              error: 'already-free'
            })
        } else if (String(teamWork.students[i].user._id) === String(req.session.user._id)) {
          // Remove current student
          teamWork.students[i].user = undefined;
          update.students.push(teamWork.students[i]);
          update.students[0].owncloudShareId = undefined;
          console.log(update);
          TeamWork
            .findByIdAndUpdate(
              req.body.id,
              {
                students: {}
              }
            )
            .exec((err) => {
              if (err) {
                console.error(err);
                return res
                  .status(500)
                  .json({
                    status: 'error',
                    error: 'mongo-err'
                  })
              }
              return owncloudController.leaveTeamWork(req, res, teamWork.students[i].owncloudShareId);
            })
        }
      }
      return res
        .status(422)
        .json({
          status: 'error',
          error: 'not-your-position'
        })
    })
}*/

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

module.exports.addFeedback = (req, res) => {
  if (req.body.id == undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-id'
      })
  } else if (req.body.text == undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-feedback'
      })
  }
  TeamWork
    .updateOne(
      {
        _id: req.body.id
      },
      {
        $push: {
          feedbacks: {
            author: req.session.user._id,
            date: moment(),
            student: req.body.student,
            text: req.body.text,
          }
        }
      }
    )
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
}

module.exports.editSetudentPosition = (req, res) => {
  if (req.body.twid == undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-twid'
      })
  } else if (req.body.id == undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-id'
      })
  } else if (req.body.specialization == undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-specialization'
      })
  } else if (req.body.task == undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-text'
      })
  }
  TeamWork
    .findById(req.body.twid)
    .exec((err, teamwork) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: err
          })
      }
      let userChanged = false;
      let previousShareId = null;
      if (req.body.id == 'new') {
        teamwork.students.push({
          task: req.body.task,
          position: req.body.specialization,
          user: req.body.user,
        })
        userChanged = true;
      }
      for (let i = 0; i < teamwork.students.length; i++) {
        if (teamwork.students[i]._id != req.body.id) {
          continue;
        }
        teamwork.students[i].task = req.body.task;
        teamwork.students[i].position = req.body.specialization;
        previousShareId = teamwork.students[i].owncloudShareId;
        if (teamwork.students[i].user == undefined || teamwork.students[i].user != req.body.user) {
          teamwork.students[i].user = req.body.user;
          userChanged = true;
        }
        break;
      }
      TeamWork
        .findByIdAndUpdate(
          req.body.twid,
          teamwork,
          {
            new: true,
          }
        )
        .exec((err, tw) => {
          if (err) {
            console.error(err);
            return res
              .status(500)
              .json({
                status: 'error',
                error: err
              })
          }
          if (req.body.id == 'new') {
            for (let i = 0; i < tw.students.length; i++) {
              if (
                tw.students[i].task == req.body.task &&
                tw.students[i].position == req.body.specialization &&
                tw.students[i].user == req.body.user
              ) {
                req.body.id = tw.students[i]._id;
                break;
              }
            }
          }
          if (req.body.user == null && previousShareId != null) {
            return owncloudController.deleteShare(req, res, previousShareId);
          } else if (userChanged && req.body.user != null) {
            User
              .findById(req.body.user)
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
                if (user == null) {
                  return res
                    .status(200)
                    .json({
                      status: 'error',
                      error: 'user-not-found'
                    })
                }
                if (user.ownCloudId == null) {
                  return res
                    .status(200)
                    .json({
                      status: 'error',
                      error: 'user-doesnt-have-owncloudid-but-added-to-teamwork'
                    })
                }
                return owncloudController.shareTeamworkFolderToUser(req, res, teamwork, user.ownCloudId, 15, user.type, req.body.id, previousShareId)
              })
          } else {
            return res
              .status(200)
              .json({
                status: 'ok'
              })
          }
        })
    })
}

module.exports.deletePosition = (req, res) => {
  if (req.body.twid == undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-twid'
      })
  } else if (req.body.id == undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-id'
      })
  } else if (req.body.usertype == undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-user-type'
      })
  } else if (!['student', 'guarantor', 'consultant'].includes(req.body.usertype)) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'bad-user-type'
      })
  }
  TeamWork
    .findById(req.body.twid)
    .exec((err, teamwork) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: err
          })
      }
      let owncloudShareId = null;
      let update = {};
      if (req.body.usertype == 'student') {
        for (let i = 0; i < teamwork.students.length; i++) {
          if (teamwork.students[i].id != req.body.id) {
            continue;
          }
          owncloudShareId = teamwork.students[i].owncloudShareId;
          teamwork.students.splice(i, 1);
          break;
        }
        update.students = teamwork.students;
      } else if (req.body.usertype == 'consultant') {
        for (let i = 0; i < teamwork.consultants.length; i++) {
          if (teamwork.consultants[i].id != req.body.id) {
            continue;
          }
          owncloudShareId = teamwork.consultants[i].owncloudShareId;
          teamwork.consultants.splice(i, 1);
          break;
        }
        update.consultants = teamwork.consultants;
      } else if (req.body.usertype == 'guarantor') {
        for (let i = 0; i < teamwork.guarantors.length; i++) {
          if (teamwork.guarantors[i].id != req.body.id) {
            continue;
          }
          owncloudShareId = teamwork.guarantors[i].owncloudShareId;
          teamwork.guarantors.splice(i, 1);
          break;
        }
        update.guarantors = teamwork.guarantors;
      }
      TeamWork
        .findByIdAndUpdate(
          req.body.twid,
          update
        )
        .exec((err, tw) => {
          if (err) {
            consoler.error(err);
            return res
              .status(500)
              .json({
                status: 'error',
                error: err
              })
          }
          if (owncloudShareId != undefined) {
            return owncloudController.deleteShare(req, res, owncloudShareId)
          }
          return res
            .status(200)
            .json({
              status: 'ok'
            })
        })
    })
}

module.exports.editGuarantorAndConsultantPosition = (req, res) => {
  if (req.body.twid == undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-twid'
      })
  } else if (req.body.id == undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-id'
      })
  } else if (req.body.task == undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-text'
      })
  } else if (req.body.user == undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-user'
      })
  } else if (req.body.usertype == undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-usertype'
      })
  } else if (!['consultant', 'guarantor'].includes(req.body.usertype)) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'bad-usertype'
      })
  }
  const userType = `${req.body.usertype}s`;
  TeamWork
    .findById(req.body.twid)
    .exec((err, teamwork) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: err
          })
      }
      let userChanged = false;
      let previousShareId = null;
      if (req.body.id == 'new') {
        teamwork[userType].push({
          task: req.body.task,
          user: req.body.user,
        })
        userChanged = true;
      }
      for (let i = 0; i < teamwork[userType].length; i++) {
        if (teamwork[userType][i]._id != req.body.id) {
          continue;
        }
        teamwork[userType][i].task = req.body.task;
        previousShareId = teamwork[userType][i].owncloudShareId;
        if (teamwork[userType][i].user == undefined || teamwork[userType][i].user != req.body.user) {
          teamwork[userType][i].user = req.body.user;
          userChanged = true;
        }
        break;
      }
      TeamWork
        .findByIdAndUpdate(
          req.body.twid,
          teamwork,
          {
            new: true
          }
        )
        .exec((err, tw) => {
          if (err) {
            console.error(err);
            return res
              .status(500)
              .json({
                status: 'error',
                error: err
              })
          }
          if (req.body.id == 'new') {
            for (let i = 0; i < tw[userType].length; i++) {
              if (
                tw[userType][i].task == req.body.task &&
                tw[userType][i].position == req.body.specialization &&
                tw[userType][i].user == req.body.user
              ) {
                req.body.id = tw[userType][i]._id;
                break;
              }
            }
          }
          if (req.body.user == null && previousShareId != null) {
            return owncloudController.deleteShare(req, res, previousShareId);
          } else if (userChanged && req.body.user != null) {
            User
              .findById(req.body.user)
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
                if (user == null) {
                  return res
                    .status(200)
                    .json({
                      status: 'error',
                      error: 'user-not-found'
                    })
                }
                if (user.ownCloudId == null) {
                  return res
                    .status(200)
                    .json({
                      status: 'error',
                      error: 'user-doesnt-have-owncloudid-but-added-to-teamwork'
                    })
                }
                return owncloudController.shareTeamworkFolderToUser(req, res, teamwork, user.ownCloudId, 31, user.type, req.body.id, previousShareId)
              })
          } else {
            return res
              .status(200)
              .json({
                status: 'ok'
              })
          }
        })
    })
}