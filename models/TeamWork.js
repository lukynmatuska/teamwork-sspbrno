/**
 * Team work database model
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 */

/**
 * Libs
 */
// const moment = require('moment');

// library for easy database manipulations
const mongoose = require('../libs/db')

// the schema itself
var teamWorkSchema = new mongoose.Schema({
  name: String,
  description: String,
  students: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    position: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialization'
    },
    task: String
  }],
  guarantors: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialization'
    },
    task: String
  }],
  year: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Year'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

// export
module.exports = mongoose.model('TeamWork', teamWorkSchema, 'teamwork')
