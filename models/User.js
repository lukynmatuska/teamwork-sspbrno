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
  username: String,
  email: String,
  password: String,
  rescue: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['student', 'guarantor'],
    default: 'student'
  },
  photo: {
    type: String,
    default: '/images/users/_default.png'
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
