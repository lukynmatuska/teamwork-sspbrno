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
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  students: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    position: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialization',
      required: true
    },
    task: {
      type: String,
      required: true
    }
  }],
  guarantors: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    task: {
      type: String,
      required: true
    }
  }],
  consultants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tasks: String
  }],
  year: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Year',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
})

// export
module.exports = mongoose.model('TeamWork', teamWorkSchema, 'teamwork')
