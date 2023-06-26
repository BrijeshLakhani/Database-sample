module.exports = {
  appName: 'hapi-18-boilerplate',
  port: 1400,
  debug: {
    request: ['error', 'info'],
    log: ['info', 'error', 'warning']
  },
  connections: {
    db: process.env.DB
  }
}
