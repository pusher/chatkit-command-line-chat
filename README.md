# Pusher Relay Chat 💬
> Terminal chat application built with Pusher Chatkit! 🚀

## Requirements
Prior to running this locally, you'll need a Chatkit instance. 

To create one, navigate to the [Pusher Dashboard](https://dash.pusher.com/), login and hit **create new**, enter a name for the instance. Make sure to note down your **Instance Locator** and **Secret Key**, located under the `keys` tab, as we'll need this later!

## Install

### Install dependencies
```
npm install
```

### Server
Edit `server.js`, replacing `YOUR_INSTANCE_LOCATOR` and `YOUR_KEY` with your **Instance Locator** and **Secret Key** respectively.

Run the auth server via:
```
node server.js
```

### Client
Create a user/room via the inspector in the Pusher Dashboard.

Edit `client.js`, replacing `YOUR_INSTANCE_LOCATOR` with your **Instance Locator**.

Run the client via:
```
node client.js
```
