'use strict';

const config = require('config');
const Joi = require('joi').extend(require('@joi/date'));
Joi.objectId = require('joi-objectid')(Joi);
const fileUploadHelper = require('@utilities/uploadFile-helper');
const Boom = require('@hapi/boom');
const helper = require('@utilities/helper');
const bcrypt = require('bcryptjs');
const token = require('@utilities/create-token');
const nodemailer = require('nodemailer');

const errorHelper = require('@utilities/error-helper');
// const moment = require('moment');

const UserModel = require('@models/user.model').schema;

module.exports = {
  signUp: {
    validate: {
      headers: helper.apiHeaders(),
      payload: Joi.object().keys({
        firstName: Joi.string().required().trim().label('First Name'),
        lastName: Joi.string().required().trim().label('Last Name'),
        email: Joi.string().required().trim().label('Email'),
        userName: Joi.string().required().trim().label('User Name'),
        address1: Joi.string().allow('', null).trim().label('Address line 1'),
        address2: Joi.string().allow('', null).trim().label('Address line 2'),
        city: Joi.string().required().trim().label('City'),
        state: Joi.string().allow('', null).label('State'),
        country: Joi.string().allow('', null).label('Country'),
        zip: Joi.number().required().label('Zip'),
        password: Joi.string().required().trim().label('Password'),
        coPassword: Joi.string().required().trim().label('Confirm Password'),
      }),
      // .options({ allowUnknown: true }),
    },
    pre: [],
    handler: async (req, h) => {
      const firstName = req.payload.firstName;
      const lastName = req.payload.lastName;
      const email = req.payload.email;
      const userName = req.payload.userName;
      const address1 = req.payload.address1;
      const address2 = req.payload.address2;
      const city = req.payload.city;
      const state = req.payload.state;
      const country = req.payload.country;
      const zip = req.payload.zip;
      const password = req.payload.password;
      // const coPassword = req.payload.coPassword;
      try {
        let signUpData = await UserModel.find({
          $or: [{ email: email }, { userName: userName }],
        });

        if (signUpData.length && signUpData) {
          return errorHelper.handleError({
            status: 400,
            code: 'bad_request',
            message: 'userName or email is all ready Exists.....!',
          });
        } else {
          const saltRounds = 10;
          bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err) {
              return errorHelper.handleError({
                status: 400,
                code: 'bad_request',
                message: 'Password Must be Strong!!!',
              });
            } else {
              const user = await UserModel.create({
                firstName: firstName,
                lastName: lastName,
                email: email,
                userName: userName,
                address1: address1,
                address2: address2,
                city: city,
                state: state,
                country: country,
                zip: zip,
                password: hash,
              });
            }
          });
          return {
            status: 200,
            code: 'success',
            message:
              'Congratulations, your account has been successfully created.',
          };
        }
      } catch (err) {
        errorHelper.handleError(err);
      }
    },
  },

  login: {
    validate: {
      headers: helper.apiHeaders(),
      payload: Joi.object().keys({
        email: Joi.string().required().trim().label('email'),
        password: Joi.string().required().trim().label('password'),
      }),
    },
    pre: [],
    handler: async (req, h) => {
      const getUser = await UserModel.findOne({
        $or: [{ userName: req.payload.email }, { email: req.payload.email }],
      });

      return new Promise(async (resolve) => {
        if (getUser != null) {
          if (
            getUser.username == req.payload.username ||
            getUser.email == req.payload.username
          ) {
            bcrypt.compare(
              req.payload.password,
              getUser.password,
              (err, result) => {
                const credentailsToken = token.createToken(
                  getUser,
                  config.constants.EXPIRATION_PERIOD,
                );
                if (result) {
                  resolve({
                    msg: 'Login Sucessfull!🎉',
                    token: credentailsToken,
                    user: getUser,
                  });
                } else {
                  resolve({
                    status: 400,
                    code: 'bad_request',
                    msg: 'Password is not Valid!!☢',
                  });
                }
              },
            );
          }
        } else {
          resolve({
            status: 400,
            code: 'bad_request',
            msg: 'User Details is not Valid!!☢',
          });
        }
      });
    },
  },

  signInGoogle: {
    validate: {
      headers: helper.apiHeaders(),
      payload: Joi.object().keys({
        idToken: Joi.string().required().label('id Token'),
        id: Joi.string().required().label('id'),
        firstName: Joi.string().required().label('First Name'),
        lastName: Joi.string().required().label('Last Name'),
        email: Joi.string().required().label('Email'),
        name: Joi.string().required().label('name'),
        photoUrl: Joi.any().allow('', null).label('photo url'),
        provider: Joi.string().required().label('provider'),
      }),
    },
    pre: [],
    handler: async (req, h) => {
      const payload = req.payload;
      try {
        return new Promise(async (resolve) => {
          const userData = await UserModel.findOne({
            $or: [{ email: payload.email }, { userName: payload.name }],
          });
          if (userData && userData.provider == 'GOOGLE') {
            // send token
            const credentailsToken = token.createToken(
              userData,
              config.constants.EXPIRATION_PERIOD,
            );
            resolve({
              msg: 'SignIn with google Sucessfull!🎉',
              token: credentailsToken,
              // token: payload.idToken,
              user: userData,
            });
          } else {
            //cretae and send token

            function generatePassword() {
              let pass = Array(10)
                .fill(
                  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$',
                )
                .map(function (x) {
                  return x[Math.floor(Math.random() * x.length)];
                })
                .join('');
              return pass;
            }
            const resPass = generatePassword();
            let userData2 = {};

            const saltRounds = 10;
            bcrypt.hash(resPass, saltRounds, async (err, hash) => {
              if (err) {
                generatePassword();
              } else {
                // random Storng passowrd genrate;
                userData2 = await UserModel.create({
                  firstName: payload.firstName,
                  lastName: payload.lastName,
                  email: payload.email,
                  userName: payload.name,
                  provider: payload.provider,
                  userImage: payload.photoUrl,
                  password: hash,
                });
              }
              const credentailsToken = token.createToken(
                userData2,
                config.constants.EXPIRATION_PERIOD,
              );

              resolve({
                msg: 'Your account was created successfully and signIn with google Sucessfull!🎉',
                token: credentailsToken,
                user: userData2,
              });
            });
          }
        });
      } catch (error) {
        errorHelper.handleError(error);
      }
    },
  },

  getUSers: {
    validate: {
      headers: helper.apiHeaders(),
      query: Joi.object().keys({
        // search: Joi.string().allow('', null),
        uID: Joi.any().allow('', null),
      }),
    },
    pre: [],
    handler: async (req, h) => {
      const params = {
        _id: req.query.uID,
      };
      if (params._id) {
        return await UserModel.find(params);
      } else {
        // console.log('await UserModel.find();: ', await UserModel.find());
        return await UserModel.find();
      }
    },
  },

  editUser: {
    validate: {
      headers: helper.apiHeaders(),
      payload: Joi.object().keys({
        userID: Joi.string().required().label('user ID'),
        userImage: Joi.any().allow('', null).label('user Image'),
        firstName: Joi.string().required().label('First Name'),
        lastName: Joi.string().required().label('Last Name'),
        email: Joi.string().required().label('Email'),
        userName: Joi.string().required().label('User Name'),
        address1: Joi.string().allow('', null).label('Address line 1'),
        address2: Joi.string().allow('', null).label('Address line 2'),
        city: Joi.string().allow('', null).label('City'),
        state: Joi.string().allow('', null).label('State'),
        country: Joi.string().allow('', null).label('Country'),
        zip: Joi.number().allow('', null).label('Zip'),
        password: Joi.string().required().label('Password'),
      }),
    },
    pre: [],
    handler: async (req, h) => {
      let userPayload = req.payload;
      const getUser = await UserModel.findById(userPayload.userID);
      return new Promise(async (resolve) => {
        if (getUser != null) {
          bcrypt.compare(
            req.payload.password,
            getUser.password,
            async (err, result) => {
              if (result) {
                delete userPayload.password;
                delete userPayload.userID;
                // console.log('userPayload: after delete=================== ', userPayload);

                const credentailsToken = token.createToken(
                  getUser,
                  config.constants.EXPIRATION_PERIOD,
                );
                if (userPayload.userImage) {
                  const file = userPayload.userImage;
                  const filePath = `${config.constants.s3Prefix}`;

                  const fileUpload = async (file) => {
                    //buket
                    // const upload = await fileUploadHelper.handleFileUpload(file, filePath);
                    //local
                    const upload = await fileUploadHelper.uploadLocalFile(
                      file,
                      filePath,
                    );
                    return upload;
                  };
                  const res = await fileUpload(file);
                  userPayload['userImage'] = res.filePath; // modify payload
                }
                resolve({
                  status: 200,
                  code: 'success',
                  message: 'Your profile update succesfully...',
                  user: await UserModel.findByIdAndUpdate(
                    getUser._id,
                    userPayload,
                    { new: true },
                  ),
                  token: credentailsToken,
                });
              } else {
                resolve({
                  status: 400,
                  code: 'bad_request',
                  message: 'password dose not match!!',
                });
              }
            },
          );
        }
      });
    },
  },

  assignRole: {
    validate: {
      headers: helper.apiHeaders(),
      payload: Joi.object().keys({
        userID: Joi.string().required().trim().label('User ID'),
        role: Joi.string().required().trim().label('role'),
      }),
    },
    pre: [],
    handler: async (req, h) => {
      const user = await UserModel.findOne({
        _id: req.payload.userID,
      });

      const checkUser = await UserModel.findByIdAndUpdate(req.payload.userID, {
        role: req.payload.role,
        mobile: user.supplierRequest.mobile,
        companyEmail: user.supplierRequest.companyEmail,
        shopName: user.supplierRequest.shopName,
        shopAddress: user.supplierRequest.shopAddress,
        supplierRequest: null,
      });

      if (checkUser) {
        const trasporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'mr.roy2329@gmail.com',
            pass: 'uftnutzbljtncjsh',
          },
        });

        const mailOption = {
          from: 'mr.roy2329@gmail.com',
          to: checkUser.email,
          subject: 'congratulations🎉🎊',
          html: `<html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Forgot Password</title>
      </head>
      <body>
        <div style="text-align: center;">
          <h1>Dear ${checkUser.userName}</h1>
          <br />
          <p>congratulations, you are now ${req.payload.role}</p>
          <br />
          <p>see you soon on our website</p>
          <br />
          <p>Sportingly</p>
          <strong>B-mart</strong>
          <br/>
          <br/>
        </div>
      </body>
    </html> `,
        };

        const result = await trasporter.sendMail(mailOption);

        const email = checkUser.email;
        const partialEmail = email.replace(
          /(\w{3})[\w.-]+@([\w.]+\w)/,
          '$1***@$2',
        );

        return {
          status: 'success',
          code: 200,
          message: `mail send successfully on ${partialEmail}`,
        };
      } else {
        errorHelper.handleError(Boom.badRequest(`An error occured!`));
      }
    },
  },

  changePass: {
    validate: {
      payload: Joi.object().keys({
        userID: Joi.string().required().trim().label('User ID'),
        oldPassword: Joi.string().required().trim().label('old Password'),
        password: Joi.string().required().trim().label('Password'),
        coPassword: Joi.string().required().trim().label('confirm Password'),
      }),
    },
    pre: [],
    handler: async (req, h) => {
      const getUser = await UserModel.findById(req.payload.userID);
      return new Promise(async (resolve) => {
        if (getUser != null) {
          bcrypt.compare(
            req.payload.oldPassword,
            getUser.password,
            async (err, result) => {
              if (result) {
                if (req.payload.password == req.payload.coPassword) {
                  const saltRounds = 10;
                  bcrypt.hash(
                    req.payload.password,
                    saltRounds,
                    async (err, hash) => {
                      await UserModel.findByIdAndUpdate(req.payload.userID, {
                        password: hash,
                      });
                    },
                  );
                  resolve({
                    code: 200,
                    status: 'success',
                    message: 'Change Password Succesfully',
                  });
                } else {
                  resolve({
                    status: 'bad_request',
                    code: 400,
                    message: 'Password does not Match!!!',
                  });
                }
              } else {
                resolve({
                  status: 'bad_request',
                  code: 400,
                  message: 'Old Password does not Match!!!',
                });
              }
            },
          );
        } else {
          errorHelper.handleError(Boom.badRequest(`An error occured!!!`));
        }
      });
    },
  },

  forgotReq: {
    validate: {
      headers: helper.apiHeaders(),
      payload: Joi.object().keys({
        userID: Joi.string().required().label('user ID'),
      }),
    },
    pre: [],
    handler: async (req, h) => {
      let Otp = Math.floor(Math.random() * 1000000);
      const checkUser = await UserModel.findOne({ email: req.payload.userID });

      if (checkUser) {
        const trasporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'mr.roy2329@gmail.com',
            pass: 'uftnutzbljtncjsh',
          },
        });

        const mailOption = {
          from: 'mr.roy2329@gmail.com',
          to: req.payload.userID,
          subject: 'Resetting Your B-mart account Password',
          html: `<html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Forgot Password</title>
        </head>
        <body>
          <div style="text-align: center;">
            <h1>Hello ${checkUser.userName}</h1>
            <br />
            <p>You have requested to reset the password of your B-mart account</p>
            <br />
            <br />
            <p>Please find the security code to change your password</p>
            <br />
            <h2>${Otp}</h2>
            <br />
            <p>see you soon on our website</p>
            <br />
            <p>Sportingly</p>
            <strong>B-mart</strong>
            <br/>
            <br/>
          </div>
        </body>
      </html> `,
        };

        const result = await trasporter.sendMail(mailOption);

        // gerate partial Email
        const email = checkUser.email;
        const partialEmail = email.replace(
          /(\w{3})[\w.-]+@([\w.]+\w)/,
          '$1***@$2',
        );

        return {
          status: 200,
          code: 'success',
          message: `OTP sent to ${partialEmail}`,
          otp: Otp,
          data: checkUser,
        };
      } else {
        errorHelper.handleError(Boom.badRequest(`An error occured!`));
      }
    },
  },

  resetPassword: {
    validate: {
      headers: helper.apiHeaders(),
      payload: Joi.object().keys({
        id: Joi.string().required().label('id'),
        password: Joi.string().required().label('password'),
        cpassword: Joi.string().required().label('confirm password'),
      }),
    },
    pre: [],
    handler: async (req, h) => {
      const payload = req.payload;
      if (payload.id) {
        if (payload.password == payload.cpassword) {
          const saltRounds = 10;
          bcrypt.hash(payload.password, saltRounds, async (err, hash) => {
            await UserModel.findByIdAndUpdate(payload.id, {
              password: hash,
            });
          });
          return {
            statusCode: 200,
            status: 'success',
            message: 'Change Password Succesfully',
          };
        } else {
          errorHelper.handleError(Boom.badRequest(`Password Does Not Match!`));
        }
      } else {
        errorHelper.handleError(Boom.badRequest(`An error occured!`));
      }
    },
  },

  updateRequest: {
    validate: {},
    pre: [],
    handler: async (req, h) => {
      let userPayload = req.payload;
      const getUser = await UserModel.findById(userPayload.userID);
      return new Promise(async (resolve) => {
        if (getUser != null) {
          bcrypt.compare(
            req.payload.password,
            getUser.password,
            async (err, result) => {
              if (result) {
                const request = await UserModel.findByIdAndUpdate(
                  req.payload.userID,
                  {
                    supplierRequest: {
                      companyEmail: req.payload.email,
                      mobile: req.payload.mobile,
                      shopName: req.payload.shopName,
                      shopAddress: req.payload.shopAddress,
                    },
                  },
                );
                resolve({
                  status: 200,
                  code: 'success',
                  message: 'request send successfully...',
                });
              } else {
                resolve({
                  status: 400,
                  code: 'bad_request',
                  message: 'password dose not match!!',
                });
              }
            },
          );
        } else {
          errorHelper.handleError(
            Boom.badRequest('Cart limit is already exceed!'),
          );
        }
      });
    },
  },
};
