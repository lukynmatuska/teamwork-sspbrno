/**
 * Year database model
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 */

// library for easy database manipulations
const mongoose = require('../libs/db')

// the schema itself
var yearSchema = new mongoose.Schema({
  name: String,
  description: String,
  status: {
    type: String,
    enum: ['active', 'archived', 'prepared'],
    default: 'prepared'
  },
  created: Date
})

// export
module.exports = mongoose.model('Year', yearSchema, 'year')
