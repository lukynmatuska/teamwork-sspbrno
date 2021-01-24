/**
 * User controller
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 */

/**
 * Libs
 */
const bcrypt = require('bcrypt')
const xlsx = require('node-xlsx').default
const randomstring = require("randomstring")
const emailController = require('./email')

/**
 * Models
 */
const User = require('../models/User')
const Teamwork = require('../models/TeamWork')
const Specialization = require('../models/Specialization')

function createNewUserInMongoDB(req, res, userType) {
  let years = []
  if (['admin', 'guarantor', 'consultant'].includes(userType)) {
    years.push({
      year: req.session.year._id,
      permissions: 'edit'
    })
  } else {
    years.push({
      year: req.session.year._id,
      permissions: 'read'
    })
  }
  new User({
    name: {
      first: (req.body.firstname !== undefined ? req.body.firstname.trim() : undefined),
      middle: (req.body.middlename !== undefined ? req.body.middlename.trim() : undefined),
      last: (req.body.lastname !== undefined ? req.body.lastname.trim() : undefined)
    },
    specialization: req.body.specialization,
    password: bcrypt.hashSync(req.body.password, 15),
    email: req.body.email,
    type: userType,
    years
  })
    .save()
    .then(u => u
      .populate('specialization')
      .populate('years.year')
      .execPopulate()
    )
    .then(user => {
      emailController.send('newUser', user, (err, info, response) => {
        if (err) {
          console.error(err.message)
          return res
            .status(500)
            .json({
              status: 'error',
              error: 'err-sending-email'
            })
        }
        if (req.session.user === undefined) {
          // Sort years by name
          user.years.sort((a, b) => {
            if (a.year == undefined || a.year == null) {
              return 1
            }
            if (Number(a.year.name) > Number(b.year.name)) {
              return -1
            }
            if (Number(a.year.name) < Number(b.year.name)) {
              return 1
            }
            return 0
          })
          req.session.user = user
        }
        return res
          .status(200)
          .json({
            status: 'ok'
          })
      })
    })
}

module.exports.new = (req, res) => {
  let userType
  if (req.body.password === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-password'
      })
  } else if (req.body.email === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-email'
      })
  } else if (req.body.specialization === undefined) {
    if (!(req.session.user === undefined ? false : (req.session.user.type === 'admin'))) {
      return res
        .status(422)
        .json({
          status: 'error',
          error: 'not-send-user-specialization'
        })
    }
  } else if (req.body.usertype === undefined) {
    userType = 'student'
  } else if (req.body.usertype != undefined && (req.session.user == undefined ? false : (req.session.user.type == 'admin'))) {
    userType = req.body.usertype
  }
  req.body.email = req.body.email.trim().toLowerCase()

  User.countDocuments({
    type: 'admin'
  }, (err, countOfUsers) => {
    if (err) {
      console.error(err)
      return res
        .status(500)
        .json({
          status: 'error',
          error: 'err-mongo-count-documents'
        })
    }
    // First user in MongoDB will be the Admin
    if (countOfUsers === 0) {
      userType = 'admin'
    }

    User.findOne({
      email: req.body.email
    })
      .exec((err, user) => {
        if (err) {
          return console.error(err)
        }

        if (user && user.email === req.body.email) {
          // user with that email exists
          return res
            .status(500)
            .json({
              status: 'error',
              error: 'email-exist'
            })
        }

        if (req.body.specialization === '') {
          User.countDocuments({}, (err, count) => {
            if (err) {
              console.error(err)
              return res
                .status(500)
                .json({
                  status: 'error',
                  error: 'err-mongo-count-documents'
                })
            } else if (count === 0) {
              return res
                .status(422)
                .json({
                  status: 'error',
                  error: 'bad-specialization-id'
                })
            } else {
              req.body.specialization = undefined
              return createNewUserInMongoDB(req, res, userType)
            }
          })
        } else {
          return createNewUserInMongoDB(req, res, userType)
        }
      })
  })
}

module.exports.login = (req, res) => {
  if (req.body.password === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-password'
      })
  } else if (req.body.email === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-email'
      })
  }
  User
    .findOne({
      email: req.body.email.trim().toLowerCase()
    })
    .populate('specialization')
    .populate('years.year')
    .exec((err, user) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: 'err-mongo-finding-user'
          })
      } else if (user === null) {
        return res
          .status(422)
          .json({
            status: 'error',
            error: 'wrong-email'
          })
      } else {
        bcrypt.compare(req.body.password, user.password, (err, same) => {
          if (err) {
            console.error(err)
            return res
              .status(500)
              .json({
                status: 'error',
                error: 'err-bcrypt-compare'
              })
          } else if (!same) {
            return res
              .status(422)
              .json({
                status: 'error',
                error: 'wrong-password'
              })
          } else {
            // Sort years by name
            user.years.sort((a, b) => {
              if (a.year == undefined || a.year == null) {
                return 1
              }
              if (Number(a.year.name) > Number(b.year.name)) {
                return -1
              }
              if (Number(a.year.name) < Number(b.year.name)) {
                return 1
              }
              return 0
            })
            req.session.user = user
            return res
              .status(200)
              .json({
                status: 'ok'
              })
          }
        })
      }
    })
}

module.exports.edit = (req, res) => {
  const update = {
    name: {}
  }
  let id = req.session.user._id

  if (req.body.firstname !== undefined) {
    update.name.first = req.body.firstname
  }

  if (req.body.middlename !== undefined) {
    update.name.middle = req.body.middlename
  }

  if (req.body.lastname !== undefined) {
    update.name.last = req.body.lastname
  }

  if (req.body.email !== undefined) {
    update.email = req.body.email
  }

  if (Object.keys(update.name).length === 0) {
    delete update.name
  }

  if (req.session.user.type === 'admin') {
    if (req.body.id !== undefined) {
      id = req.body.id
    }

    if (req.body.years !== undefined) {
      update.years = req.body.years
    }

    if (req.body.type !== undefined) {
      update.type = req.body.type
      if (update.type !== 'student') {
        update.specialization = undefined
      }
    }

    if (req.body.specialization !== undefined) {
      update.specialization = req.body.specialization
    }
  }

  User
    .findByIdAndUpdate(id, update, { new: true })
    .populate('specialization')
    .populate('years.year')
    .exec((err, user) => {
      if (err) {
        console.error(err)
        if (err.code == 11000) {
          return res
            .status(422)
            .json({
              status: 'error',
              error: 'email-exists'
            })
        }
        return res
          .status(500)
          .json({
            status: 'error',
            error: 'mongo-error'
          })
      } else if (id === req.session.user._id) {
        // Sort years by name
        user.years.sort((a, b) => {
          if (a.year == undefined || a.year == null) {
            return 1
          }
          if (Number(a.year.name) > Number(b.year.name)) {
            return -1
          }
          if (Number(a.year.name) < Number(b.year.name)) {
            return 1
          }
          return 0
        })
        req.session.user = user
      }
      return res
        .status(200)
        .json({
          status: 'ok'
        })
    })
}

module.exports.enableRescue = (req, res) => {
  if (req.body.email === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-email'
      })
  } else {
    User
      .findOneAndUpdate({
        email: req.body.email.trim().toLowerCase()
      }, {
        rescue: {
          enabled: true,
          hash: randomstring.generate()
        }
      }, {
        new: true,
        returnOriginal: false
      })
      // .populate('specialization')
      // .populate('years.year')
      .exec((err, user) => {
        if (err) {
          console.error(err)
          return res
            .status(500)
            .json({
              status: 'error',
              error: 'mongo-err'
            })
        } else if (user === null) {
          return res
            .status(422)
            .send({
              status: 'error',
              error: 'wrong-email'
            })
        } else {
          emailController.send('enableRescue', user, (err, info, response) => {
            if (err) {
              console.error(`Error occurred when sending email:\n${err.message}`)
              return res
                .status(400)
                .json({
                  status: 'error',
                  error: err.message
                })
            } else {
              return res
                .status(200)
                .json({
                  status: 'ok'
                })
            }
          })
        }
      })
  }
}

module.exports.rescuePassword = (req, res) => {
  if (req.session.user == undefined && req.body.hash == undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-hash'
      })
  } else if (req.body.password === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-password'
      })
  }
  User
    .findOneAndUpdate({
      rescue: {
        enabled: true,
        hash: req.body.hash
      }
    }, {
      rescue: {
        enabled: false,
      },
      password: bcrypt.hashSync(req.body.password, 15)
    }, {
      new: true
    })
    .populate('specialization')
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
      } else if (user === null) {
        return res
          .status(404)
          .json({
            status: 'error',
            error: 'wrong-email'
          })
      } else {
        if (req.session.user == undefined) {
          // Sort years by name
          user.years.sort((a, b) => {
            if (a.year == undefined || a.year == null) {
              return 1
            }
            if (Number(a.year.name) > Number(b.year.name)) {
              return -1
            }
            if (Number(a.year.name) < Number(b.year.name)) {
              return 1
            }
            return 0
          })
          req.session.user = user
        }
        emailController.send('rescuePassword', user, (err, info, response) => {
          if (err) {
            console.error(`Error occurred when sending email:\n${err.message}`)
            return res
              .status(400)
              .json({
                status: 'error',
                error: 'Problém s odesíláním emailu.'
              })
          } else {
            return res
              .status(200)
              .json({
                status: 'ok'
              })
          }
        })
      }
    })
}

module.exports.setNewPassword = (req, res) => {
  if (req.body.id === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-user-id'
      })
  } else if (req.body.password === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-password'
      })
  }
  User
    .findById(req.body.id)
    .exec((err, user) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: 'mongo-err'
          })
      }

      if (!user.rescue.enabled || req.session.user != undefined) {
        if (req.session.user.type === 'admin' || req.session.user._id === user._id) {

        } else {
          return res.status(403).send('403')
        }
      }
      User
        .findByIdAndUpdate(
          req.body.id,
          {
            rescue: {
              enabled: false,
            },
            password: bcrypt.hashSync(req.body.password, 15)
          },
          {
            new: true
          }
        )
        .populate('specialization')
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
          } else if (user === null) {
            return res
              .status(404)
              .json({
                status: 'error',
                error: 'wrong-email'
              })
          } else {
            if (req.session.user !== undefined) {
              if (req.session.user._id === user._id) {
                // Sort years by name
                user.years.sort((a, b) => {
                  if (a.year == undefined || a.year == null) {
                    return 1
                  }
                  if (Number(a.year.name) > Number(b.year.name)) {
                    return -1
                  }
                  if (Number(a.year.name) < Number(b.year.name)) {
                    return 1
                  }
                  return 0
                })
                req.session.user = user
              }
            }
            emailController.send('setNewPassword', user, (err, info, response) => {
              if (err) {
                console.error(`Error occurred when sending email:\n${err.message}`)
                return res
                  .status(400)
                  .json({
                    status: 'error',
                    error: 'Problém s odesíláním emailu.'
                  })
              } else {
                return res
                  .status(200)
                  .json({
                    status: 'ok'
                  })
              }
            })
          }
        })
    })
}

module.exports.updatePassword = async (req, res) => {
  if (req.body.newPassword === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-new-password'
      })
  } else if (req.body.newPasswordRepeat === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-new-password-repeat'
      })
  } else if (req.body.oldPassword === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-old-password'
      })
  } else if (req.body.newPassword != req.body.newPasswordRepeat) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'passwords-not-match'
      })
  }
  let newPassword = bcrypt.hashSync(req.body.newPassword, 15)
  let match = await bcrypt.compare(req.body.oldPassword, req.session.user.password)
  if (!match) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'bad-old-password'
      })
  }
  User
    .findByIdAndUpdate(
      req.session.user._id,
      {
        password: newPassword
      },
      {
        new: true
      }
    )
    .populate('specialization')
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
      // Sort years by name
      user.years.sort((a, b) => {
        if (a.year == undefined || a.year == null) {
          return 1
        }
        if (Number(a.year.name) > Number(b.year.name)) {
          return -1
        }
        if (Number(a.year.name) < Number(b.year.name)) {
          return 1
        }
        return 0
      })
      req.session.user = user
      emailController.send('rescuePassword', user, (err, info, response) => {
        if (err) {
          console.error(`Error occurred when sending email:\n${err.message}`)
          return res
            .status(400)
            .json({
              status: 'error',
              error: 'Problém s odesíláním emailu.'
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

module.exports.updateSession = (req, res) => {
  User
    .findById(req.session.user._id)
    .populate('specialization')
    .populate('years.year')
    .exec((err, user) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: 'mongo-error'
          })
      }
      if (user != undefined || user != null) {
        // Sort years by name
        user.years.sort((a, b) => {
          if (a.year == undefined || a.year == null) {
            return 1
          }
          if (Number(a.year.name) > Number(b.year.name)) {
            return -1
          }
          if (Number(a.year.name) < Number(b.year.name)) {
            return 1
          }
          return 0
        })
      }
      req.session.user = user
      return res
        .status(200)
        .json({
          status: 'ok'
        })
    })
}

module.exports.changeType = (req, res) => {
  if (req.body.id === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-id'
      })
  } else if (req.body.type === undefined) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-type'
      })
  } else if (!User.schema.path('type').enumValues.includes(req.body.type)) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'invalid-type'
      })
  }
  User
    .findByIdAndUpdate(req.body.id, { type: req.body.type })
    .exec((err) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: 'mongo-error'
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
  User
    .find(filter)
    .populate('specialization')
    .populate('years.year')
    .select({
      email: 1,
      name: 1,
      photo: 1,
      type: 1,
      rescue: 1,
      years: 1
    })
    .exec((err, users) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: 'mongo-err'
          })
      }
      res.header("x-total-count", users.length)
      res.header('Access-Control-Expose-Headers', 'X-Total-Count')
      res.header('Access-Control-Expose-Headers', 'Content-Range')
      res.header('Content-Range', `users 0-1/${users.length}`)
      return res
        .status(200)
        .json(users)
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
  Teamwork
    .findOne({
      $or: [
        {
          'students.user': req.body.id
        }, {
          'guarantors.user': req.body.id
        }, {
          'consultants.user': req.body.id
        }
      ]
    })
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
      if (teamwork != null) {
        return res
          .status(400)
          .json({
            status: 'error',
            error: 'user-is-in-teamwork'
          })
      }
      User
        .deleteOne({
          _id: req.body.id
        })
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

module.exports.parseStudentsXlsx = (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      status: 'error',
      error: 'No files were uploaded.'
    })
  }

  const studentsFromTable = xlsx.parse(req.files.xlsx.data)[0].data
  studentsFromTable.shift()
  let setOfSpecializationsFromExcel = new Set()
  let students = []
  for (let [i, student] of studentsFromTable.entries()) {
    if (student.length > 0) {
      setOfSpecializationsFromExcel.add(student[4])
      students.push({
        id: i,
        name: {
          first: student[2],
          last: student[1]
        },
        email: student[3],
        type: req.body.userType,
        specialization: student[4]
      })
    }
  }

  Specialization
    .find({})
    .exec(async (err, specializationsFromDB) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            error: err
          })
      }

      /* Create dictionary of shortnames and names of specializations from DB */
      let dictOfSpecializationsFromDB = {}
      specializationsFromDB.forEach(spec => {
        dictOfSpecializationsFromDB[spec.short] = spec
      })
      let setOfSpecializationsFromDB = new Set(Object.keys(dictOfSpecializationsFromDB))

      /* Check if specializations from Excel are in DB */
      for (specialization of setOfSpecializationsFromExcel) {
        if (!setOfSpecializationsFromDB.has(specialization)) {
          console.log(specialization)
          return res
            .status(400)
            .json({
              status: 'error',
              error: 'specialization-from-table-is-not-in-db',
              specialization: specialization
            })
        }
      }

      return res
        .status(200)
        .json({
          status: 'ok',
          users: students
        })
    })
}

module.exports.import = async (req, res) => {
  if (req.body.user === undefined) {
    return res
      .status(400)
      .json({
        status: 'error',
        error: 'not-send-user'
      })
  } else if (req.body.userType === undefined) {
    req.body.userType = 'student'
  }
  if (req.body.userType === 'student') {
    Specialization
      .find({
        short: req.body.user.specialization
      })
      .exec(async (err, specialization) => {
        if (err) {
          console.error(err)
          return res
            .status(500)
            .json({
              status: 'error',
              error: err
            })
        }
        if (specialization == null) {
          return res
            .status(400)
            .json({
              status: 'error',
              error: 'specialization-from-table-is-not-in-db',
              specialization: specialization
            })

        }

        try {
          let student = JSON.parse(req.body.user)
          student.id = undefined
          student.specialization = specialization._id
          student.rescue = {
            enabled: true,
            hash: randomstring.generate()
          }
          student.password = student.rescue.hash
          student.years = [{
            year: req.session.year._id,
            permissions: 'read'
          }]
          new User(student).save((err, student) => {
            if (err) {
              if (err.code === 11000 && err.keyPattern.email === 1) {
                return res
                  .status(500)
                  .json({
                    status: 'error',
                    error: 'Email už se nachází v databázi.'
                  })
              }
              console.error(err)
              return res
                .status(500)
                .json({
                  status: 'error',
                  error: err.errmsg
                })
            }
            emailController.send('importedStudent', student, (err, info, response) => {
              if (err) {
                console.error(`Error occurred when sending email:\n${err.message}`)
                return res
                  .status(400)
                  .json({
                    status: 'error',
                    error: 'Problém s odesíláním emailu.'
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
        } catch (err) {
          console.error(err)
          return res
            .status(500)
            .json({
              status: 'error',
              error: err
            })
        }
      })
  }
}

module.exports.isGivenSpecializationMine = (req, res) => {
  if (req.query.id === undefined || req.query.id == null) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-id'
      })
  }
  let data
  if (req.session.user == undefined || req.session.user == null) {
    data = false
  } else if (req.session.user.specialization == undefined) {
    data = false
  } else {
    data = String(req.session.user.specialization._id) == String(req.query.id)
  }
  return res
    .status(200)
    .json({
      status: 'ok',
      data
    })
}

module.exports.hasUserGivenSpecialization = (req, res) => {
  if (req.query.id == undefined || req.query.id == null) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-id'
      })
  }
  if (req.query.specialization == undefined || req.query.specialization == null) {
    return res
      .status(422)
      .json({
        status: 'error',
        error: 'not-send-specialization'
      })
  }
  User
    .countDocuments({
      _id: req.query.id,
      specialization: req.query.specialization
    })
    .exec((err, countOfUsers) => {
      if (err) {
        console.error(err)
        return res
          .status(500)
          .json({
            status: 'error',
            'error': 'mongo-err'
          })
      }
      let data
      if (countOfUsers == undefined || countOfUsers == null) {
        data = false
      } else if (countOfUsers == 1) {
        data = true
      } else {
        data = false
      }
      return res
        .status(200)
        .json({
          status: 'ok',
          data
        })
    })
}

module.exports.isGivenIdMine = (req, res) => {
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
  return res
    .status(200)
    .json({
      status: 'ok',
      data: (String(req.session.user._id) == String(req.query.id))
    })
}