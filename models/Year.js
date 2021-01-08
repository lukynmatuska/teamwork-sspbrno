/**
 * Year database model
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 */

// library for easy database manipulations
const mongoose = require('../libs/db')

// the schema itself
var yearSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  startOfSelectionOfTeamWorks: {
    type: Date,
    required: true
  },
  description: String,
  endOfSelectionOfTeamWorks: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'prepared'],
    default: 'prepared'
  },
  created: Date
})

// Duplicate the ID field.
yearSchema.virtual('id').get(function(){
  return this._id.toHexString()
})

// Ensure virtual fields are serialised.
yearSchema.set('toJSON', {
  virtuals: true
})

// export
module.exports = mongoose.model('Year', yearSchema, 'year')
