module.exports = {
  appName: 'b-mart',

  port: 1402,

  debug: {
    request: ['error', 'info'],
    log: ['info', 'error', 'warning']
  },

  constants: {
    s3Prefix: 'local',
    API_BASEPATH: 'localhost:1400',
    DEFAULT_COUNTRY: 'IND',
    DEFAULT_TIMEZONE: 'Asia/Kolkata',
    SERVER_TIMEZONE: 'Asia/Kolkata',
    EXPIRATION_PERIOD: '24h',
    JWT_SECRET: 'b-mart-authorizeuser'
  },

  connections: {
    db: process.env.DB
  }
}
