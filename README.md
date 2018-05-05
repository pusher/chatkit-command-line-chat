# Pusher Relay Chat 💬
> Terminal chat application built with Pusher Chatkit! 🚀

## Environment Variables
### Server
* `INSTANCE_LOCATOR`
* `SECRET_KEY`

### Client
* `INSTANCE_LOCATOR`

## Server
Run the auth server via:
```
cd api/
npm i
INSTANCE_LOCATOR=YOUR_INSTANCE_LOCATOR CHATKIT_KEY=YOUR_CHATKIT_KEY npm start
```

## Client
Create a user/room via the inspector in the Pusher Dashboard.

Run the client via:
```
cd api/
npm i
INSTANCE_LOCATOR=YOUR_INSTANCE_LOCATOR node index.js
```
