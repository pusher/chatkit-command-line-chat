const util = require('util');
const {JSDOM} = require('jsdom');
const {ChatManager, TokenProvider} = require('@pusher/chatkit');
const readline = require('readline');
const axios = require('axios');
const prompt = require('prompt');
const ora = require('ora');
const blessed = require('blessed');
const clear = require('clear');

// Hack so that @pusher/chatkit can be used
const {window} = new JSDOM();
global.window = window;
global.navigator = {};

const {log} = console;

const {INSTANCE_LOCATOR: instanceLocator} = process.env;
const AUTH_URL = 'http://localhost:3000';

if (!instanceLocator) {
  log('Please set INSTANCE_LOCATOR environment variable');
  process.exit(1);
}

const authenticate = async name => {
  const {status} = await axios.post(AUTH_URL + '/users', {name});
  if (status !== 201) {
    throw new Error('Failed to authenticate');
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

    const {username: userId} = await get(usernameSchema);

    try {
      spinner.start('Authenticating..');
      await authenticate(userId);
      spinner.succeed(`Authenticated as ${userId}`);
    } catch (err) {
      spinner.fail();
      throw err;
    }

    const chatManager = new ChatManager({
      instanceLocator,
      userId,
      tokenProvider: new TokenProvider({url: AUTH_URL + '/auth'}),
    });

    spinner.start('Connecting to Pusher..');
    const currentUser = await chatManager.connect();
    spinner.succeed('Connected');

    spinner.start('Fetching rooms..');

    const joinableRooms = await currentUser.getJoinableRooms();
    spinner.succeed('Fetched rooms');

    const availableRooms = [...currentUser.rooms, ...joinableRooms];

    if (!availableRooms) throw new Error('No available rooms to join');

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
    const {id: roomId, name: roomName} = availableRooms[roomNumber];

    spinner.start(`Joining room ${roomNumber}..`);

    await currentUser.subscribeToRoom({
      roomId: roomId,
      hooks: {
        onNewMessage: message => {
          const {senderId, text} = message;
          if (senderId === userId) return;
          log(`${senderId}: ${text}`);
        },
        onUserJoined: ({name}) => {
          log(`${name} joined`);
        },
      },
      messageLimit: 0,
    });
    spinner.succeed(`Joined ${roomName}`);
    log(
      'You may now send and receive messages. Type your message and hit <Enter> to send.',
    );

    const input = readline.createInterface({input: process.stdin});

    input.on('line', async text => {
      // TODO: Handle rejection here!
      await currentUser.sendMessage({roomId, text});
    });
  } catch (err) {
    spinner.fail();
    log(err);
    process.exit(1);
  }
})();
