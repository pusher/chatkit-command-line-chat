const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Chatkit = require('@pusher/chatkit-server');

const {INSTANCE_LOCATOR: instanceLocator, CHATKIT_KEY: key} = process.env;
if (!instanceLocator || !key) {
  console.log('INSTANCE_LOCATOR or CHATKIT_KEY not set in environment.');
  process.exit(1);
}

const app = express();

const chatkit = new Chatkit.default({
  instanceLocator,
  key,
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

app.post('/users', (req, res) => {
  const {username} = req.body;
  chatkit
    .createUser({id: username, name: username})
    .then(() => res.sendStatus(201))
    .catch(err => {
      if (err.error === 'services/chatkit/user_already_exists') {
        res.sendStatus(200);
      } else {
        res.status(err.status).json(err);
      }
    });
});

app.post('/authenticate', (req, res) => {
  const authData = chatkit.authenticate({userId: req.query.user_id});
  res.status(authData.status).send(authData.body);
});

const PORT = 3001;

app.listen(PORT, err => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Running on port ${PORT}`);
  }
});
