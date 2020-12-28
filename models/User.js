/**
 * User database model
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 */

/**
 * Libs
 */
// library for easy database manipulations
const mongoose = require('../libs/db')

// the schema itself
var userSchema = new mongoose.Schema({
  name: {
    first: String,
    middle: String,
    last: String
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  rescue: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['student', 'guarantor', 'admin', 'consultant'],
    default: 'student'
  },
  photo: {
    type: String,
    default: '/images/users/_default.png'
  },
  specialization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialization'
  },
  years: [{
    year: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Year'
    },
    permissions: [{
      type: String,
      enum: ['read', 'edit'],
      default: 'read'
    }]
  }],
  logins: [
    {
      time: Date,
      ip: String
    }
  ]
})

// export
module.exports = mongoose.model('User', userSchema, 'user')
