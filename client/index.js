const util = require('util');
const {JSDOM} = require('jsdom');
const {ChatManager, TokenProvider} = require('@pusher/chatkit');
const readline = require('readline');
const axios = require('axios');
const prompt = require('prompt');
const ora = require('ora');

const {log} = console;

/* 
 * Chatkit does not currently support Node, so let's make it think we're a browser env!
 * Follow the issue on GitHub: https://github.com/pusher/chatkit-client-js/issues/70
 */
const makeChatkitNodeCompatible = () => {
  const {window} = new JSDOM();
  global.window = window;
  global.navigator = {};
};

makeChatkitNodeCompatible();

const {INSTANCE_LOCATOR: instanceLocator} = process.env;
const AUTH_URL = 'http://localhost:3001';

if (!instanceLocator) {
  log('Please set INSTANCE_LOCATOR environment variable');
  process.exit(1);
}

const authenticate = async username => {
  try {
    const {data} = await axios.post(AUTH_URL + '/users', {username});
  } catch ({message}) {
    throw new Error(`Failed to authenticate, ${message}`);
  }
};

(async () => {
  const spinner = ora();
  try {
    prompt.start();
    prompt.message = '';

    const get = util.promisify(prompt.get);

    const usernameSchema = [
      {
        description: 'Enter your username',
        name: 'username',
        type: 'string',
        pattern: /^[a-zA-Z0-9\-]+$/,
        message: 'Username must be only letters, numbers, or dashes',
        required: true,
      },
    ];

    const {username} = await get(usernameSchema);

    try {
      spinner.start('Authenticating..');
      await authenticate(username);
      spinner.succeed(`Authenticated as ${username}`);
    } catch (err) {
      spinner.fail();
      throw err;
    }

    const chatManager = new ChatManager({
      instanceLocator,
      userId: username,
      tokenProvider: new TokenProvider({url: AUTH_URL + '/authenticate'}),
    });

    spinner.start('Connecting to Pusher..');
    const currentUser = await chatManager.connect();
    spinner.succeed('Connected');

    spinner.start('Fetching rooms..');
    const joinableRooms = await currentUser.getJoinableRooms();
    spinner.succeed('Fetched rooms');

    const availableRooms = [...currentUser.rooms, ...joinableRooms];

    if (!availableRooms)
      throw new Error(
        "Couldn't find any available rooms. If you're the developer, go to dash.pusher.com, open your Chatkit instance, and create a room (or two!) using the Inspector tab!",
      );

    log('Available rooms:');
    availableRooms.forEach((room, index) => {
      log(`${index} - ${room.name}`);
    });

    const roomSchema = [
      {
        description: 'Select a room',
        name: 'room',
        type: 'number',
        cast: 'integer',
        pattern: /^[0-9]+$/,
        conform: v => {
          if (v >= availableRooms.length) {
            return false;
          }
          return true;
        },
        message: 'Room must only be numbers',
        required: true,
      },
    ];

    const {room: roomNumber} = await get(roomSchema);
    const room = availableRooms[roomNumber];

    spinner.start(`Joining room ${roomNumber}..`);

    await currentUser.subscribeToRoom({
      roomId: room.id,
      hooks: {
        onNewMessage: message => {
          const {senderId, text} = message;
          if (senderId === username) return;
          log(`${senderId}: ${text}`);
        },
        onUserJoined: ({name}) => {
          log(`${name} joined`);
        },
      },
      messageLimit: 0,
    });
    spinner.succeed(`Joined ${room.name}`);
    log(
      'You may now send and receive messages. Type your message and hit <Enter> to send.',
    );

    const input = readline.createInterface({input: process.stdin});

    input.on('line', async text => {
      await currentUser.sendMessage({roomId: room.id, text});
    });
  } catch (err) {
    spinner.fail();
    log(err);
    process.exit(1);
  }
})();
