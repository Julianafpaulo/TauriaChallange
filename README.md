# TauriaChallenge

A demo server that handles HTTP requests for User and Room Management using Typescript and Express.

## Installation

Use the following command to run the develop mode:

```bash
npm run dev
```
Or to start the application normally:

```bash
npm run start
```
The application will start on the following port: 
```bash
http://localhost:5000/
```
## Usage
In the main folder, you can find a .json Postman Collection file with the requests for each functionality. 

Users: 
- Get users (no auth required): returns a list of all users.
- Get users (no auth required): takes a username and return the user with matching username.
- Register (no auth required): takes a username, password and optional string for mobile_token. Registers the user and authenticates the client as the newly created user.
- Sign in/authenticate: takes a username and password, and authenticates the user.
- Update User (must be signed in as the user): updates password and/or mobile_token of the user.
- Delete User (must be signed in as the user): deletes the user.

Rooms:
- Create a room (signed in as a user): creates a room hosted by the current user, with an optional capacity limit. Default is 5.
- Change host (must be signin as the host): changes the host of the user from the current user to another user.
- Join/leave (signed in as a user): joins/leaves the room as the current user.
- Get info (no auth): given a room guid, gets information about a room.
- Search for the rooms that a user is in: given a username, returns a list of rooms that the user is in.

## Authors

Juliana de Faria Paulo
