module.exports = {
  // location
  protocol: 'http',
  url: 'localhost',
  port: 3000,

  // database credentials
  db: {
    port: 27017,
    host: 'localhost',
    name: 'teamwork',
    user: 'teamwork',
    password: 'password',
    options: ''
  },

  session: {
    secret: 'very strong password for session',
    maxAge: 86400000
  },

  devMode: false,

  cors_options: {
    credentials: true,
    origin: ['http://localhost:3000']
  },

  owncloud: {
    baseUrl: 'https://cloud.example.com',
    username: 'user',
    password: 'pass',
    folder: ''
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

  contactPersonEmail: 'teamworks@sspbrno.com',

  redis: {
    url: 'redis://localhost:6379'
  }
}
