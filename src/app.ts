import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import {Room,User} from '../src/types';

const app: Application = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

let rooms: Room[] = [];
let users: User[] = [];

// ---------USERS---------// TODO: Treat error messages

//GET All Users - ok
app.get('/users', (req: Request, res: Response, next: NextFunction) => {
    res.send(users);
    return users;
});
//GET User By Username - ok
app.get('/users/:id', (req: Request, res: Response, next: NextFunction) => {
    let id = req.params.id;
    let user1;
    users.find(function (user) {
        if (user.id === id) {
            user1 =user;
        }
    });
    if(user1){
        return res.send(user1);
    } else {
            return res.status(404).json({
                status: 'error',
                message: 'User Not Found'
            });
        }
});
//REGISTER User - ok
app.post('/users', function (req: Request, res: Response, next: NextFunction) {
    if (!req.body.id || !req.body.password) {
        res.status(400);
        res.send("Invalid details!");
    } else {
        users.filter(function (user) {
            if (user.id === req.body.id) {
                res.render('signup', {
                    message: "User Already Exists! Login or choose another user id"
                });
            }
        });
        var newUser: User = { id: req.body.id, pass: req.body.password };
        users.push(newUser);
        return res.status(201).json({
            status: 'Created',
            message: "User "+req.body.id+" created "
        });
    }
});
//LOGIN - ok
app.post('/login', function (req: Request, res: Response, next: NextFunction) {
    console.log(users);
    if (!req.body.id || !req.body.password) {
        res.render('login', { message: "Please enter both id and password" });
    } else {
        users.filter(function (user) {
            if (user.id === req.body.id && user.pass === req.body.password) {
                req.session!.loggedin = true;
                req.session!.username = user.id;
                req.session!.pass = user.pass;
                return res.status(200).json({
                    status: 'Ok',
                    message: "User "+user.id+" Logged "
                });
            }
        });
    }
});
//UPDATE User - ok
app.put('/users/:id', function (req: Request, res: Response, next: NextFunction) {
    let id = req.params.id;
    if (req.session!.loggedin && req.session!.username === id) {
        users.find(function (user) {
            if (user.id === id) {
                user.pass = req.body.pass;
                user.mobile_token = req.body.mobile_token;
            }
        });
        return res.status(200).json({
            status: 'Ok',
            message: "User "+id+" Updated "
        });
    } else {
        return res.status(422).json({
            status: 'error',
            message: 'Can\'t update an user that is not yours'
        });
    }

});
//DELETE User - ok
app.delete('/users/:id', function (req: Request, res: Response, next: NextFunction) {
    let id = req.params.id;
    if (req.session!.loggedin && req.session!.username === id) {
        const users1 = users.filter(function (user) {
            return user.id != id
        });
        users = users1;
        return res.status(200).json({
            status: 'Ok',
            message: "User "+id+" Deleted "
        });
    } else {
        return res.status(422).json({
            status: 'error',
            message: 'Can\'t delete an user that is not yours'
        });
    }
});

// ---------ROOMS---------
//CREATE a room -ok
app.post('/room', function (req: Request, res: Response, next: NextFunction) {
    if (req.session!.loggedin) {
        var newRoom: Room = {
            name: req.body.name,
            guid: req.body.guid,
            host: req.session!.username,
            participants: req.body.participants,
            capacity: req.body.capacity || 5
        }; 
        rooms.push(newRoom);
        return res.status(201).json({
            status: 'Created',
            message: "Room with guid \'"+req.body.guid+"\' created "
        });
    } else {
        return res.status(422).json({
            status: 'error',
            message: 'Can\'t create a room if not logged in'
        });
    }
});
//CHANGE room's host - OK
app.put('/room/:guid', function (req, res) {
    let guid = req.params.guid;
    if (req.session!.loggedin) {
        rooms.filter(function (room) {
            if (room.guid === guid && room.host === req.session!.username) {
                room.host = req.body.newHost
                return res.status(200).json({
                    status: 'ok',
                    message: "New host is "+req.body.newHost+" to room with guid " + guid
                });
            } else {
                return res.status(422).json({
                    status: 'error',
                    message: 'Can\'t change the host of a room that is not yours'
                });
            }
        });
    }
});
//JOIN Room - OK
app.post('/room/join/:guid', (req: Request, res: Response, next: NextFunction) => {
    let guid = req.params.guid;
    let room1=undefined;;
    if (req.session!.loggedin) {
        rooms.find(function (room) {
            if (room.guid === guid && room.capacity>room.participants.length) {
                console.log(room.participants.length);
                var newUser: string = req.session!.username
                room.participants.push(newUser);
                room1=room;
            } 
        });
        if(room1){
            return res.status(200).json({
                status: 'Ok',
                message: "Joinned the room with guid " + guid
            });
        }else{
            return res.status(422).json({
                status: 'error',
                message: 'Can\'t join meeting, room is full'
            });
    }
}
});
//Leave Room - OK
app.post('/room/leave/:guid', function (req, res) {
    let guid = req.params.guid;
    let room1=undefined;
    if (req.session!.loggedin) {
        rooms.find(function (room) {
            if (room.guid === guid && room.participants.find(user =>user === req.session!.username)) {
                const users = room.participants.filter(function (user) {
                    return user != req.session!.username
                });
                room.participants = users;       
                room1=room;
             } 
        });
        if(room1!=undefined){
            return res.status(200).json({
                status: 'ok',
                message: "Left the room with guid " + guid
            });    
        }else {
            return res.status(422).json({
                status: 'error',
                message: 'Can\'t leave a room that you\'re not participating'
            });
        }
    }
});
//GET Room Info -OK
app.get('/room/:guid', (req: Request, res: Response, next: NextFunction) => {
    let guid = req.params.guid;
    let room1;
    rooms.find(function (room) {
        if (room.guid === guid) {
            room1=room;
        } 
    });
    if(room1){
        return res.send(room1);
    }else {
        return res.status(404).json({
            status: 'error',
            message: 'Can\'t find room'
        });
    }
});
//SEARCH rooms where user is in - OK
app.get('/user/rooms', (req: Request, res: Response, next: NextFunction) => {
    let userrooms: Room[] = []
    rooms.filter(function (room) {
        if (room.participants.includes(req.session!.username)){
            userrooms.push(room);
        }
    });
    res.send(userrooms);
});


app.listen(5000, () => console.log('Server running'));