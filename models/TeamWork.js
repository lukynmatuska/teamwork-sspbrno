/**
 * Team work database model
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.2
 */

/**
 * Libs
 */
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
  number: {
    type: Number,
    default: 0
  },
  result: {
    type: String,
    required: true,
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
    },
    owncloudShareId: String,
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
    },
    owncloudShareId: String,
  }],
  consultants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    task: String,
    owncloudShareId: String,
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
  },
  media: {
    type: Object,
    default: {},
    kanban: String,
    meeting: String,
    repositories: [String],
  },
  owncloud: {
    link: String,
  },
  finalFeedback: {
    type: String,
  },
  feedbacks: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    text: {
      type: String,
      required: true
    },
  }],
})

// Duplicate the ID field.
teamWorkSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

teamWorkSchema.virtual('fullname').get(function () {
  if (this.number == undefined || this.number == null) {
    return this.name
  } else {
    return String(`${this.number} ${this.name}`)
  }
})

// Ensure virtual fields are serialised.
teamWorkSchema.set('toJSON', {
  virtuals: true
})

// export
module.exports = mongoose.model('TeamWork', teamWorkSchema, 'teamwork')
