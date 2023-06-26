'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Types = Schema.Types;

const modelName = 'users';

const dbConn = require('@plugins/mongoose.plugin').plugin.dbConn();

const userSchema = new Schema(
  {
    roleId: {
      type: Types.ObjectId,
      default: null,
      required: true,
    },
    fullName: {
      type: Types.String,
      default: null,
      required: true,
    },
    email: {
      type: Types.String,
      default: null,
      required: true,
    },
    userName: {
      type: Types.String,
      default: null,
      required: true,
    },
    address: {
      type: Types.String,
      default: ' ',
    },
    remarks: {
      type: Types.String,
      default: ' ',
    },
    shopOWner: {
      type: Types.String,
      default: ' ',
      required: true,
    },
    isActive: {
      type: Types.Boolean,
      default: true,
      required: true,
    },
    deleted: {
      type: Types.Boolean,
      default: false,
    },
    PAN_No: {
      type: Types.String,
      default: ' ',
      required: true,
    },
    Bank_Name: {
      type: Types.String,
      default: ' ',
      required: true, 
    },
    Bank_Account_Type: {
      type: Types.String,
      default: ' ',
      required: true,
    },
    BANK_MICR_CODE: {
      type: Types.String,
      default: ' ',
      required: true,
    },
    BANK_IFCA_CODE: {
      type: Types.String,
      default: ' ',
      required: true,
    },
    BANK_ACCOUNT_NO: {
      type: Types.Number,
      default: ' ',
      required: true,
    },
    password: {
      type: Types.String,
      required: true,
    },
    LastLoginDate: {
      type: Types.Date,
      default: null
    },
  },
  {
    versionKey: false,
    strict: false,
    timestamps: true,
  },
);

exports.schema = dbConn.model(modelName, userSchema);