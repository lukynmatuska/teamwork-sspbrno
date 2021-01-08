/**
 * Team work teamplate database model
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 */

/**
 * Libs
 */
// library for easy database manipulations
const mongoose = require('../libs/db')

// the schema itself
var teamWorkTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  result: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: '1A'
  },
  students: [{
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
      ref: 'User'
    },
    task: String
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
})

// Duplicate the ID field.
teamWorkTemplateSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

// Ensure virtual fields are serialised.
teamWorkTemplateSchema.set('toJSON', {
  virtuals: true
})

// export
module.exports = mongoose.model('TeamWorkTemplate', teamWorkTemplateSchema, 'teamworktemplate')
