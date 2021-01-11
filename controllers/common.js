/**
 * Common controller
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 */

/**
 * Libs
 */
const mongoose = require('mongoose')

/**
 * Models
 */
const TeamWork = require('../models/TeamWork')
// const TeamWorkTemplate = require('../models/TeamWorkTemplate')
const User = require('../models/User')
// const Year = require('../models/Year')
const Specialization = require('../models/Specialization')

module.exports.admin = {
  dashboard: async (req, res) => {
    let specializationsForClient = []
    let specializations = await Specialization.find()
    let teamworks = (await TeamWork.aggregate([{
      $match: {
        year: mongoose.Types.ObjectId(req.session.year._id)
      },
    }, {
      "$unwind": "$students"
    }, { // Count by the element as a key
      "$group": {
        "_id": "$students.position",
        "count": { "$sum": 1 },
        "students": { "$push": "$students.user" },
      }
    }]))
    for (let i = 0; i < specializations.length; i++) {
      countOfStudents = await User
        .countDocuments({
          specialization: specializations[i]._id,
          'years.year': req.session.year._id,
          type: 'student',
        })
      let countOfPositionsInTeamworks = 0
      let countOfStudentsInTeamworks = 0
      for (let ii = 0; ii < teamworks.length; ii++) {
        if (String(specializations[i]._id) === String(teamworks[ii]._id)) {
          countOfPositionsInTeamworks = teamworks[ii].count
          countOfStudentsInTeamworks = teamworks[ii].students.length
          break
        }
      }
      specializationsForClient.push({
        name: specializations[i].name,
        short: specializations[i].short,
        countOfStudents,
        countOfPositionsInTeamworks,
        countOfStudentsInTeamworks
      })
    }
    return res
      .status(200)
      .json({
        status: 'ok',
        specializations: specializationsForClient
      })
  }
}