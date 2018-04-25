const {JSDOM} = require('jsdom');
const {ChatManager, TokenProvider} = require('@pusher/chatkit');
const readline = require('readline');

// Hack so that @pusher/chatkit can be used
const {window} = new JSDOM();
global.window = window;
global.navigator = {};

const {log} = console;

const [userId, roomId] = process.argv.slice(2);
const {INSTANCE_LOCATOR: instanceLocator} = process.env;

if (!instanceLocator) {
  log('Please set INSTANCE_LOCATOR environment variable');
  process.exit(1);
}

if (!userId || !roomId) {
  log('Please pass userId & roomId (in that order) as arguments');
  process.exit(1);
}

const chatManager = new ChatManager({
  instanceLocator,
  userId,
  tokenProvider: new TokenProvider({url: 'http://localhost:3000/auth'}),
});

(async () => {
  try {
    const currentUser = await chatManager.connect();
    console.log('connected');

    await currentUser.subscribeToRoom({
      roomId: parseInt(roomId, 10),
      hooks: {
        onNewMessage: message => {
          const {senderId, text} = message;
          if (senderId === userId) return;
          console.log(`${senderId}: ${text}`);
        },
      },
      messageLimit: 0,
    });

    const input = readline.createInterface({input: process.stdin});

    input.on('line', async line => {
      await currentUser.sendMessage({roomId: roomId, text: line});
    });
  } catch (err) {
    log(err);
    process.exit(1);
  }
})();
