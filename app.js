/**
 * The entry point of the Node.js app
 * @brief The entry point for bigger sites
 * @author Lukas Matuska
 * @version 1.0
 * @license Beerware
 */

// Configuration global variable
try {
  global.CONFIG = require('./config')
} catch (error) {
  global.CONFIG = {
    protocol: process.env.PROTOCOL,
    url: process.env.URL,
    port: process.env.PORT,
    fullUrl: this.protocol + '://' + this.url + (String(this.port).length > 0 ? ':' + this.port : ''),

    session: {
      secret: process.env.SESSION_SECRET || 'secret',
      maxAge: process.env.COOKIE_MAX_AGE || 86400000
    },

    nodemailer: {
      sender: process.env.SMTP_SENDER || `Týmové práce SSPBRNO <${process.env.SMTP_USER}>`,
      settings: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE, // upgrade later with STARTTLS
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          // do not fail on invalid certs
          rejectUnauthorized: false
        }
      }
    },
    redis: {
      url: process.env.REDIS_URL
    }
  }
}

if (global.CONFIG.redis === undefined) {
  global.CONFIG.redis = {}
}

if (global.CONFIG.redis.url === undefined) {
  global.CONFIG.redis.url = 'redis://localhost:6379'
}

// Load the server lib (Express)
const express = require('express')
const app = express()

// load some libraries
const moment = require('moment')
const path = require('path')
const bodyparser = require('body-parser')

// Session handling
const session = require('express-session')
const redis = require('redis')
const RedisStore = require('connect-redis')(session)

// connect to the redis server
const redisClient = redis.createClient(global.CONFIG.redis.url)
const store = new RedisStore({
  // host: 'localhost',
  // port: 6379,
  client: redisClient,
  ttl: 86400
})

// set up the redis store to saving session data
app.use(session({
  secret: global.CONFIG.session.secret,
  store,
  name: 'BSID',
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: global.CONFIG.session.maxAge
  }
}))

// set extended urlencoded to true (post)
app.use(bodyparser.urlencoded({ extended: true }))

// set up views directory and the rendering engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('trust proxy', true)

// set serving static files from the static dir
app.use(express.static(path.join(__dirname, 'static')))

/**
 * Routers
*/
const partials = require('./routes/partials')
app.use('/', partials.router)

const adminRouter = require('./routes/admin')
app.use('/admin', adminRouter)

const apiRouter = require('./routes/api')
app.use('/api', apiRouter)

// const userSiteRouter = require('./routes/user-site')
// app.use('/user-site', userSiteRouter)

const webRouter = require('./routes/web.js')
app.use('/', webRouter)

// run the server
app.listen(global.CONFIG.port, () => {
  console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')} Listening on port ${global.CONFIG.port} (Administration of TeamWork at SSPBRNO Node.js app)`)
})
