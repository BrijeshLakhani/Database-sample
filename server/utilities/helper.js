'use strict'

const Joi = require('joi')
const config = require('config')
// const moment = require('moment')

const apiHeaders = () => {
  return Joi.object({
    authorization: Joi.string()
  }).options({
    allowUnknown: true
  })
}

module.exports = {
    apiHeaders,
}