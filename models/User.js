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
    enum: ['student', 'guarantor', 'admin'],
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

// Duplicate the ID field.
userSchema.virtual('id').get(function(){
  return this._id.toHexString()
})

userSchema.virtual('avatar').get(function(){
  return this.photo
})

userSchema.virtual('fullName').get(function(){
  if (this.name.middle === undefined) {
    return `${this.name.first} ${this.name.last}`
  } else {
    return `${this.name.first} ${this.name.middle} ${this.name.last}`
  }
})

// Ensure virtual fields are serialised.
userSchema.set('toJSON', {
  virtuals: true
})

// export
module.exports = mongoose.model('User', userSchema, 'user')
