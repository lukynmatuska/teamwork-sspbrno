/**
 * Comment database model
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 */

/**
 * Libs
 */
// library for easy database manipulations
const mongoose = require('../libs/db')

// the schema itself
var commentSchema = new mongoose.Schema({
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
  }
})

// Duplicate the ID field.
commentSchema.virtual('id').get(function(){
  return this._id.toHexString()
})

// Ensure virtual fields are serialised.
commentSchema.set('toJSON', {
  virtuals: true
})

// export
module.exports = mongoose.model('Comment', commentSchema, 'comment')
