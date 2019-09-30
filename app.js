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

var { indexRouter, getConnectedUsers, ref } = require('./routes/index');

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
    let users = await getConnectedUsers();
    let usernames = Object.keys(users);
    socket.broadcast.emit('MESSAGE', createMsg(`${user.name} has joined the chat!`, 'Admin'));
    io.emit('UPDATE_USERS', usernames);

  })

  socket.on('NEW_MSG', (msg, callback) => {
    let message = createMsg(msg.text, msg.sender);
    // message['float'] = 09;
    //if getUserBySocketId()===msg.sender
    io.emit('MESSAGE', message);

    callback();
  })

  socket.on('disconnect', async () => {
    let users = await getConnectedUsers();
    // Object.keys(users)
    //   .map((user) => {
    //     if (users[user].socketId === socket.id) {
    //       console.log(user.name);
    //       // io.emit('MESSAGE', createMsg(`${user.name} has left the chat!`, 'Admin'))
    //       delete users[user];
    //     }
    //   })
    // console.log('After refresh/ctrl+w', users);
    // ref.set(users);
    // io.emit('MESSAGE', createMsg(`user has left the chat!`, 'Admin'))

  })
})


module.exports = { app, server, io };
