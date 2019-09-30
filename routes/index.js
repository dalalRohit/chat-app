var express = require('express');
var router = express.Router();
const { createUser, addUser, verifyUser } = require('./../utils/functions');
var uuid = require('uuid');
const moment = require('moment');

// ***************** FIREBASE => START ******************************
var admin = require("firebase-admin");
var serviceAccount = require("./../key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chat-app-c85d5.firebaseio.com"
});
var database = admin.database();
var ref = database.ref('/users');
var msgRef = database.ref('/messages')

const getConnectedUsers = async () => {
  let snapshot = await ref.once('value');
  let users = snapshot.val();
  return users;
}

//to load FIREBASE database with admin user
const loadDatabase = () => {
  const admin = {
    admin: {
      id: uuid(),
      socketId: 'my-socket-id',
      name: 'admin',
      time: moment().format('LT')

    }
  }
  ref.set(admin);
}

//to remove all users from FIREBASE except admin
const emptyDatabase = () => {
  ref.remove()
  loadDatabase();
}


// loadDatabase();
// emptyDatabase();

// ***************** FIREBASE => END ******************************

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('login', {
    pageTitle: "ChatApp | Login"
  });
});

//GET /chat [Chat page {protected}]
router.get('/chat', (req, res, next) => {
  res.render('chat', {
    pageTitle: 'ChatApp | Chat'
  })
})


//verify user sent via login form
router.post('/verify', async (req, res) => {
  let connectedUsers = await getConnectedUsers();

  const username = req.body.username;
  const socketId = req.body.socketId

  const newUser = createUser(username, socketId);
  if (verifyUser(connectedUsers, newUser)) {
    console.log(`Username ${newUser.name} is already used!`)
    return res.send(`Username ${newUser.name} is already used!`)
  }

  connectedUsers = addUser(connectedUsers, newUser);
  ref.set(connectedUsers);
  req.user = newUser;
  res.status(201).send({
    msg: `Username ${newUser.name} is valid username!`,
    user: newUser
  })

  next();


})

//Logout user
router.post('/logout', async (req, res) => {
  let x = await getConnectedUsers();
  let loggedUser = req.body.name;
  Object.keys(x).map((user) => {
    if (loggedUser === user) {
      delete x[user];
    }
  })
  ref.set(x);
  res.send({
    info: `${loggedUser} logged out!`,
    users: x
  })

})

module.exports = {
  indexRouter: router,
  getConnectedUsers,
  ref
};
