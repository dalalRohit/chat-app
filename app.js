var createError = require('http-errors');
var express = require('express');
const helmet = require('helmet')
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var logger = require('morgan');
var expressLayouts = require('express-ejs-layouts');
var axios = require('axios');
var { createMsg, getUserBySocketId } = require('./utils/functions');

var indexRouter = require('./routes/index');

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

app.use(helmet())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));

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

  socket.on('USER_CONNECTED', (user) => {
    socket.broadcast.emit('MESSAGE', createMsg(`${user.name} has joined the chat!`, 'Admin'));
  })

  socket.on('NEW_MSG', (msg, callback) => {
    const message = createMsg(msg.text, msg.sender);
    io.emit('MESSAGE', message);

    callback();
  })

  socket.on('disconnect', () => {

    io.emit('MESSAGE', createMsg('A user has left!', 'Admin'))
  })
})


module.exports = { app, server, io };
