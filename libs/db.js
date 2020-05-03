const mongoose = require('mongoose')
const moment = require('moment')

// connect to the database
mongoose.connect(
  process.env.MONGODB_URI || `mongodb://${global.CONFIG.db.user}:${global.CONFIG.db.password}@${global.CONFIG.db.host}:${global.CONFIG.db.port}/${global.CONFIG.db.name}?${global.CONFIG.db.options}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  },
  (err) => {
    if (err) { return console.error(err) }
    console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')} Connected to MongoDB!`)
  })

module.exports = mongoose
