# Pusher Relay Chat 💬
> Terminal chat application built with Pusher Chatkit! 🚀

## Environment Variables
### Server
* `INSTANCE_LOCATOR`
* `CHATKIT_KEY`

### Client
* `INSTANCE_LOCATOR`

## Requirements
Prior to running this locally, you'll need a Chatkit instance. 

To create one, navigate to the [Pusher Dashboard](https://dash.pusher.com/), login and hit **create new**, enter a name for the instance. Make sure to note down your **Instance Locator** and **Secret Key**, located under the `keys` tab, as we'll need this later!

## Server

### Mac/Linux
Run the auth server via:
```
cd api/
npm i
INSTANCE_LOCATOR=YOUR_INSTANCE_LOCATOR CHATKIT_KEY=YOUR_CHATKIT_KEY npm start
```

### Windows
Run the auth server via:
```
dir api
npm i
set INSTANCE_LOCATOR=YOUR_INSTANCE_LOCATOR
set CHATKIT_KEY=YOUR_CHATKIT_KEY
npm start
```


## Client
Create a user/room via the inspector in the Pusher Dashboard.

Run the client via:
```
cd api/
npm i
INSTANCE_LOCATOR=YOUR_INSTANCE_LOCATOR node index.js
```
