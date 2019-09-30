var createError = require('http-errors');
var express = require('express');
// const helmet = require('helmet')
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var logger = require('morgan');
var expressLayouts = require('express-ejs-layouts');
var axios = require('axios');
var { createMsg, getUserBySocketId } = require('./utils/functions');

var { indexRouter, getConnectedUsers, msgRef, getAllMessages, database } = require('./routes/index');

var app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var server = require('http').Server(app);
var io = require('socket.io')(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

// app.use(helmet())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/', express.static(path.join(__dirname, './views/')))
app.use(function (req, res, next) {
  res.io = io;
  next();
});

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


io.on('connection', (socket) => {
  console.log('New WebSocket connection! ', socket.id);

  socket.emit('MESSAGE', createMsg('Welcome to ChatApp!', 'Admin'));

  socket.on('USER_CONNECTED', async (user) => {
    socket.broadcast.emit('MESSAGE', createMsg(`${user.name} has joined the chat!`, 'Admin'));
  })

  socket.on('NEW_MSG', async (msg, callback) => {
    let message = createMsg(msg.text, msg.sender);
    // console.log(message);
    // let messages = await getAllMessages();
    // let users = await getConnectedUsers();
    // let usernames = Object.keys(messages).map((user) => user);
    // // database.ref(`/messages/rohit`)
    // //   .push({
    // //     id: 'asdjoisaidnlkan',
    // //     username: 'ashish',
    // //     text: "Hello,I'm the ashish of this app![2]",
    // //     sent: 'asdnasdlkda'
    // //   })
    // usernames.map((user) => {
    //   if (user === msg.sender) {
    //     database.ref(`/messages/${user}`)
    //       .push(message)
    //   }
    // })

    io.emit('MESSAGE', message);

    callback();
  })


  socket.on('disconnect', async () => {
    // let users = await getConnectedUsers();
  })


})


module.exports = { app, server, io };
