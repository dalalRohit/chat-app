const { createUser } = require('./utils/functions');
const { app } = require('./app')
console.log(app);

const manager = (socket) => {
    //Welcome message
    socket.emit('MESSAGE', `Welcome to ChatApp!`);

    //USER_CONNECTED
    socket.on('USER_CONNECTED', (user) => {
        const newUser = createUser(user);
        socket.user = user;
        socket.broadcast.emit('USER_JOINED', newUser);
    })

    socket.on('NEW_MSG', (msg) => {
        // console.log(io);
        io.emit('MESSAGE', msg);
    })
    //GoodBye Message
    socket.on('disconnect', () => {
        console.log(`Client ${socket.id} disconnected!`)
    })
}

module.exports = manager;