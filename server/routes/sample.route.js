'use strict';
// Never take constants here
module.exports = {
  plugin: {
    async register(server, options) {
      const API = require('@api/auth.api');
      server.route([
        {
          method: 'post',
          path: '/signIn',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy'],
            },
            tags: ['api', 'Authentication'],
            description: 'Login',
            notes: 'Login',
            validate: API.login.validate,
            pre: API.login.pre,
            handler: API.login.handler,
          },
        },

        {
          method: 'post',
          path: '/googleSignIn',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy'],
            },
            tags: ['api', 'Authentication'],
            description: 'SignIN with Google',
            notes: 'SignIN with Google',
            validate: API.signInGoogle.validate,
            pre: API.signInGoogle.pre,
            handler: API.signInGoogle.handler,
          },
        },

        {
          method: 'post',
          path: '/signUp',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy'],
            },
            tags: ['api', 'Authentication'],
            description: 'signUp',
            notes: 'signUp',
            validate: API.signUp.validate,
            pre: API.signUp.pre,
            handler: API.signUp.handler,
          },
        },

        {
          method: 'get',
          path: '/users',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy'],
            },
            tags: ['api', 'Authentication'],
            description: 'get Users',
            notes: 'get Users',
            validate: API.getUSers.validate,
            pre: API.getUSers.pre,
            handler: API.getUSers.handler,
          },
        },

        {
          method: 'put',
          path: '/editUser',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy'],
              'hapi-swagger': {
                payloadType: 'form',
              },
            },
            payload: {
              maxBytes: 1024 * 1024 * 5,
              multipart: {
                output: 'stream',
              },
              parse: true,
              allow: 'multipart/form-data',
              timeout: false,
            },
            tags: ['api', 'Authentication'],
            description: 'edit User Details',
            notes: 'edit User Details',
            validate: API.editUser.validate,
            pre: API.editUser.pre,
            handler: API.editUser.handler,
          },
        },

        {
          method: 'put',
          path: '/role',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy'],
            },
            tags: ['api', 'Authentication'],
            description: 'Assign role to user',
            notes: 'Assign role to user',
            validate: API.assignRole.validate,
            pre: API.assignRole.pre,
            handler: API.assignRole.handler,
          },
        },

        {
          method: 'post',
          path: '/request',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy'],
            },
            tags: ['api', 'Authentication'],
            description: 'user request for update role',
            notes: 'user request for update role',
            validate: API.updateRequest.validate,
            pre: API.updateRequest.pre,
            handler: API.updateRequest.handler,
          },
        },

        {
          method: 'put',
          path: '/change-pass',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy'],
            },
            tags: ['api', 'Authentication'],
            description: 'chnage user password',
            notes: 'chnage user password',
            validate: API.changePass.validate,
            pre: API.changePass.pre,
            handler: API.changePass.handler,
          },
        },

        {
          method: 'post',
          path: '/forgot-password',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy'],
            },
            tags: ['api', 'Authentication'],
            description: 'Request for forgot user password',
            notes: 'Request for forgot user password',
            validate: API.forgotReq.validate,
            pre: API.forgotReq.pre,
            handler: API.forgotReq.handler,
          },
        },

        {
          method: 'put',
          path: '/reset-password',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy'],
            },
            tags: ['api', 'Authentication'],
            description: 'reset B-mart user password',
            notes: 'reset B-mart user password',
            validate: API.resetPassword.validate,
            pre: API.resetPassword.pre,
            handler: API.resetPassword.handler,
          },
        },
      ]);
    },
    version: require('../../package.json').version,
    name: 'auth-routes',
  },
};
