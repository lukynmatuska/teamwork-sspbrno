/**
 * User controller
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 */

/**
 * Libs
 */
const bcrypt = require('bcrypt')
const osloveni = require('../libs/osloveni')
const nodemailer = require('nodemailer')
const xlsx = require('node-xlsx').default
const randomstring = require("randomstring")
const imageDataURI = require('image-data-uri')

/**
 * Models
 */
const User = require('../models/User')
const Specialization = require('../models/Specialization')

function createNewUserInMongoDB(req, res, userType) {
  new User({
    name: {
      first: (req.body.firstname !== undefined ? req.body.firstname.trim() : undefined),
      middle: (req.body.middlename !== undefined ? req.body.middlename.trim() : undefined),
      last: (req.body.lastname !== undefined ? req.body.lastname.trim() : undefined)
    },
    specialization: req.body.specialization,
    password: bcrypt.hashSync(req.body.password, 15),
    email: req.body.email,
    type: userType
  })
    .save()
    .then(u => u
      .populate('specialization')
      .populate('years.year')
      .execPopulate()
    )
    .then(user => {
      // Send email
      const transporter = nodemailer.createTransport(global.CONFIG.nodemailer.settings)
      const text = `Dobrý den ${osloveni(user.name.first)},\n\nVáš účet v týmových pracích je připraven.\nMůžete se přihlásit na ${global.CONFIG.url}/login\n\nS přáním hezkého dne,\nOlda Vrátník\nSprávce uživatelských účtů týmových prací`
      const message = {
        from: global.CONFIG.nodemailer.sender,
        to: `"${user.name.first}${user.name.middle !== undefined ? ` ${user.name.middle} ` : ''} ${user.name.last}" <${user.email}>`,
        subject: 'Váš nový účet 👤🔑',
        text
      }

      transporter.sendMail(message, (err, info, response) => {
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
  } else if (req.body.usertype !== undefined && (req.session.user !== undefined ? (req.session.user.type === 'admin') : false)) {
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
        rescue: true
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
            // .status(404)
            .send({
              status: 'error',
              error: 'wrong-email'
            })
        } else {
          // Send email
          const transporter = nodemailer.createTransport(global.CONFIG.nodemailer.settings)
          const text = `Dobrý den ${osloveni(user.name.first)},\n\njelikož máte účet v týmových pracích a požádal jste o změnu hesla, zde je možnost: ${global.CONFIG.url}/forgot-password/${user._id}/\n\nS přáním hezkého dne,\nOlda Vrátník\nSprávce uživatelských účtů týmových prací`
          const message = {
            from: global.CONFIG.nodemailer.sender,
            to: `"${user.name.first}${user.name.middle !== undefined ? ` ${user.name.middle} ` : ''} ${user.name.last}" <${user.email}>`,
            subject: 'Zapomenuté heslo',
            text
          }

          transporter.sendMail(message, (err, info, response) => {
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
  } else {
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

        if (!user.rescue || req.session.user != undefined) {
          if (req.session.user.type === 'admin' || req.session.user._id === user._id) {

          } else {
            return res.status(403).send('403')
          }
        }
        User
          .findByIdAndUpdate(
            req.body.id,
            {
              rescue: false,
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
              return res
                .status(200)
                .send({
                  status: 'ok'
                })
            }
          })
      })
  }
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
      return res
        .status(200)
        .send({
          status: 'ok'
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
}

module.exports.parseXlsx = (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      status: 'error',
      error: 'No files were uploaded.'
    })
  }

  if (req.body.userType === 'student') {
    const studentsFromTable = xlsx.parse(req.files.xlsx.data)[0].data
    studentsFromTable.shift()
    let setOfSpecializationsFromExcel = new Set()
    let students = []
    for (student of studentsFromTable) {
      if (student.length > 0) {
        setOfSpecializationsFromExcel.add(student[4])
        students.push({
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
}


module.exports.import = async (req, res) => {
  if (req.body.users === undefined) {
    return res
      .status(400)
      .json({
        status: 'error',
        error: 'not-send-users'
      })
  } else if (req.body.userType === undefined) {
    return res
      .status(400)
      .json({
        status: 'error',
        error: 'not-send-userType'
      })
  } else if (req.body.userType === 'student') {
    let students = JSON.parse(req.body.users)
    let setOfSpecializationsFromRequest = new Set()
    for (student of students) {
      if (Object.values(student).length > 0) {
        setOfSpecializationsFromRequest.add(student.specialization)
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

        /* Check if specializations from request are in DB */
        for (specialization of setOfSpecializationsFromRequest) {
          if (!setOfSpecializationsFromDB.has(specialization)) {
            return res
              .status(400)
              .json({
                status: 'error',
                error: 'specialization-from-table-is-not-in-db',
                specialization: specialization
              })
          }
        }

        for (student of students) {
          try {
            student.specialization = dictOfSpecializationsFromDB[student.specialization]._id
            student.rescue = true
            student.password = randomstring.generate()
            let stud = await new User(student).save()
            // Send email
            const transporter = nodemailer.createTransport(global.CONFIG.nodemailer.settings)
            const text = `Dobrý den ${osloveni(stud.name.first)},\n\nVáš účet v týmových pracích je připraven!\nZbývá už jen maličkost a tou není nic jiného, než nastavení hesla.\nTo můžeš provést zde: ${global.CONFIG.url}\n\nS přáním hezkého dne,\nOlda Vrátník\nSprávce uživatelských účtů týmových prací`
            const message = {
              from: global.CONFIG.nodemailer.sender,
              to: `"${stud.name.first}${stud.name.middle !== undefined ? ` ${stud.name.middle} ` : ''} ${stud.name.last}" <${stud.email}>`,
              subject: 'Váš nový účet 👤🔑',
              text
            }

            transporter.sendMail(message, (err, info, response) => {
              if (err) {
                console.error(`Error occurred. ${err.message}`)
                return res.status(400).json({
                  status: 'error',
                  error: err.message,
                  student: student
                })

              }
            })
          } catch (err) {
            console.error(err)
            return res
              .status(500)
              .json({
                status: 'error',
                error: err.errmsg,
                student: student
              })
          }
        }
        return res
          .status(200)
          .json({
            status: 'ok'
          })
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