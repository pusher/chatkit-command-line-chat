const Hapi = require('hapi');
const Joi = require('joi');
const Chatkit = require('@pusher/chatkit-server');

const {log} = console;

(async () => {
  const {INSTANCE_LOCATOR: instanceLocator, SECRET_KEY: key} = process.env;
  if (!instanceLocator || !key) {
    log('INSTANCE_LOCATOR or CHATKIT_KEY not set in environment.');
    process.exit(1);
  }

  const chatkit = new Chatkit.default({
    instanceLocator,
    key,
  });

  const server = Hapi.server({
    host: '127.0.0.1',
    port: 3000,
    routes: {cors: true},
  });

  server.route([
    {
      method: 'POST',
      path: '/auth',
      options: {
        validate: {
          query: {
            user_id: Joi.string().required(),
          },
          payload: {
            grant_type: Joi.string().required(),
          },
        },
      },
      handler: async (request, h) => {
        const {query: {user_id}, payload: {grant_type}} = request;
        try {
          const {body, status} = await chatkit.authenticate({
            grant_type,
            userId: user_id,
          });
          return h.response(body).code(status);
        } catch (err) {
          log(err);
          throw err;
        }
      },
    },
    {
      method: 'POST',
      path: '/users',
      options: {
        validate: {
          payload: {
            name: Joi.string().required(),
          },
        },
      },
      handler: async (request, h) => {
        const {payload: {name}} = request;
        try {
          const data = await chatkit.createUser({
            id: name,
            name,
          });
          return h.response(data).code(201);
        } catch (err) {
          if (err.error === 'services/chatkit/user_already_exists') {
            return h.response().code(201);
          }
          log(err);
          throw err;
        }
      },
    },
  ]);

  await server.start();
  log(`Server running on ${server.info.host}:${server.info.port}`);
})();
