/**
 * Specialization database model
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 */

/**
 * Libs
 */
// library for easy database manipulations
const mongoose = require('../libs/db')

// the schema itself
var specializationSchema = new mongoose.Schema({
  name: String,
  short: String
})

// Duplicate the ID field.
specializationSchema.virtual('id').get(function(){
  return this._id.toHexString()
})

// Ensure virtual fields are serialised.
specializationSchema.set('toJSON', {
  virtuals: true
})

// export
module.exports = mongoose.model('Specialization', specializationSchema, 'specialization')
