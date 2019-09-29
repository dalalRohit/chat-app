const uuid = require('uuid/v4');
const moment = require('moment');

const createUser = function (name, socketId) {
    return {
        id: uuid(),
        socketId,
        name: name.trim().toLowerCase(),
        time: moment().format('lll')
    }

}

const addUser = (userlist, user) => {
    let newList = Object.assign({}, userlist)
    newList[user.name] = user;
    return newList;
}

const createMsg = (msg, sender) => {
    return {
        text: msg,
        sender,
        createdAt: moment().format('LT')
    }
}
const verifyUser = (list, newUser) => {
    console.log(Object.keys(list));
    let u = Object.keys(list);
    for (var i = 0; i < u.length; i++) {
        if (u[i] === newUser.name) {
            return true;
            // console.log(`${newUser.name}=>${u[i]}`)
        }
    }
    return false;
}

// const 
const getUserBySocketId = (list, id) => {

}


module.exports = { createUser, createMsg, addUser, verifyUser, getUserBySocketId } 