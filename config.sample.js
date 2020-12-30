module.exports = {
  // location
  protocol: 'http',
  url: 'localhost',
  port: 3000,

  // full url
  fullUrl: this.protocol + '://' + this.url + (String(this.port).length > 0 ? ':' + this.port : ''),

  // database credentials
  db: {
    port: 27017,
    host: 'localhost',
    name: 'teamwork',
    user: 'teamwork',
    password: 'password'
  },

  session: {
    secret: 'very strong password for session',
    maxAge: 86400000
  },

  cors_options: {
    credentials: true,
    origin: 'http://localhost:3000'
  },

  nodemailer: {
    sender: 'Adolf <adolf@exmaple.com>',
    settings: {
      host: 'smtp.exmaple.com',
      port: 465,
      secure: true,
      auth: {
        user: 'adolf',
        pass: 'i want win this war'
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
      }
    }
  },

  redis: {
    url: 'redis://localhost:6379'
  }
}
