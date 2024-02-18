
# Prism Deployment Server

**Prism Deployment Server** is a simple node server to deploy and host projects of your own or compatible servers. Development is still in progress to include many other features.


# Setup

The setup of PDS was made as easy as possible for you, it is configurable in many different ways.

## Requirements

For now, some features of PDS like RCON may not work in Windows and MacOS, but it is fully compatible with other Linux based machines.
You only need a valid install of `node>=18`.

⚠️ SSL SECURITY ISSUES ⚠️
PDS will run without proper SSL certificate and private key if you set the following `ssl.bypass` property to true. Then, it is not PDS responsibility to ensure that your requests does not leak, they may be read by spywares. Even if you are on your private network, this is not safe, please consider requesting an SSL certificate and private key if you can.

## Install PDS and its dependencies

First of all, clone the repo of PDS.

`git clone https://github.com/PrismOrga/PrismDeploymentServer.git`

Next, install dependencies with following npm command.

`npm i --save`

Build client files with following command.

`npm run build`

Start one time the PDS so it can create necessary folders and files to start its configuration.

`npm run start`

PDS throws a fatal error because it is not configured properly ; you now have to configure your PDS so it can run. The goal is to make the example application located in `apps/Example` running.

## Configure the PDS

⚠️ DO NOT EDIT ANY FILE WHILE PDS IS RUNNING! ⚠️

### Configuration file

You can find the main configuration file at the following path starting from the root of the PDS: `conf.js`
- `port: number`: the port which the PDS will use on your internet connection. `[OPTIONAL]`
- `appStatus`: the constants used by the PDS server to set the status of the apps (do not touch it unless you know what you are doing).
- `ssl`:
  - `bypass: bool`: inform PDS if it might ignore SSL missing/invalid certificate and private key. IF SET TO `true` IT MIGHT CREATE SECURITY ISSUES!
  - `certificate: string`: the path of your SSL certificate (can start with a `/` for absolute path).
  - `privateKey: string`: the path of your SSL private key (can start with a `/` for absolute path).
- `jwt`:
    - `privateKey: string`: the path of your custom private jsonwebtoken key (can be text).
- `build`:  the indications for the build script used by client pages (do not touch it unless you know what you are doing).

### Applications configuration file

You can find the applications configuration file at the following path starting from the root of the PDS: `server/data/apps.json`.
All the following parameters are available in an application configuration:
- `name: string`: name of the application, needs to be unique. CASE SENSITIVE!
- `description: string`: a short description of your application.
- `location: string`: the path to your application (can start with a `/` for absolute path).
- `entryPoint: string`: the file executed first by the application when it starts (unused now).
- `launchScript`:
  - `command: string`: the command or the binary executed by the PDS to start your application.
  - `args: string[]`: the arguments that your command takes to run properly.
- `closeProcess: string`: the way the PDS will close the app :
	- `"KILL"`: will simply kill the process with node appropriate module.
	- `"RCON"`: will use the linked `rcon.closeCommand` to close the process via RCON.
- `autoRestart: bool`: settings to know if the PDS must restart your application if it closes or crash (set it as `false` by default).
- `status: number`: the status known by the PDS of your application (set it as `84` by default).
- `rcon`: `[OPTIONAL]`
  - `host: string`: the IP or DNS adresse of the application (if localhosted set it as `"127.0.0.1"`.
  - `port: number`: the port used to connect to your application via RCON.
  - `pass: string`: the password needed to establish the RCON connection.
  - `closeCommand: string`: the command used by your application through RCON to shutdown.

Here is an example of application configuration which is conform to the example application:
```json
{
    "name": "Example",
    "description": "An example of app to launch with PrismDeploymentServer",
    "location": "apps/Example",
    "entryPoint": "index.js",
    "launchScript": { "command": "npm", "args": ["run", "start"] },
    "closeProcess": "KILL",
    "autoRestart": false,
    "status": 84
}
```
You can add it inside the square brackets which are already present in the applications configuration file.

### Users configuration file

You can find the users configuration file at the following path starting from the root of the PDS: `server/data/users.json`.
You need to setup some users which would be able to interact with you PDS on the dedicated website.
A user needs to be set up with following parameters:
- `username: string`: the username of the user.
- `password: string`: the password of the user (not encrypted, you must know and manage all of the accesses!).
- `access`:
  - `api: string[]`: a list of the api routes that the user can use to interact with an app (you can set it to `["*"]` for all the routes). CASE SENSITIVE!
  - `apps: string[]`: a list of the names of the apps that the user can interact with through api routes (you can set it to `["*"]` for all the apps). CASE SENSITIVE!

Here is an example of an admin user and a simple user:
```json
{
	"username": "Admin",
	"password": "admin",
	"access": {
		"api": ["*"],
		"apps": ["*"]
	}
}
```
```json
{
	"username": "User",
	"password": "user",
	"access": {
		"api": ["/apps", "/currentLog", "/start", "/stop"],
		"apps": ["Example"]
	}
}
```
Below is the list of all the api routes the PDS uses for now:
- `/apps`: to load the list of apps.
- `/currentLog`: to load the history of application running console.
- `/start`: to start a registered application.
- `/stop`: to stop a registered application.
- `/autorestart`: to switch the state `autoRestart` of an application.
- `/rcon`: to communication with the application's RCON if available.

Even if the user has access to the api routes, if the application they want to control is not in their `apps` list, they won't be able to interact with it.

### Launch and use the PDS

Now that you configured your PDS, you'll be able to run it with following command.

`npm run start`

You can open your favorite browser and connect to the server via IP or DSN if you set this up by yourself.
By default, port is `22000`.
If you're hosting the PDS on your computer, you can access it via `https://127.0.0.1:22000`.