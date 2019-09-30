const socket = io();

//Components
const msgButton = document.querySelector('#msgBtn');
const msgForm = document.querySelector('.msgForm');
const msgInput = document.querySelector('#messageInput');
const messages = document.querySelector('.main-messages');
const userList = document.querySelector('.users');

//Template
const msgTemp = document.querySelector('#msgTemp').innerHTML;

if (localStorage.getItem('name') === null) {
    alert('No user logged in. Please login to use ChatApp');
    window.location = '/'
}
else {
    //WELCOME MESSAGE
    socket.on('GREET_MSG', (msg) => {
        console.log(msg);
    })

    //MESSAGE
    socket.on('MESSAGE', (msg) => {
        // console.log('MESSAGE', msg)
        const html = Mustache.render(msgTemp, { msg });
        messages.insertAdjacentHTML('beforeend', html);
    })

    //UPDATE USERNAMES
    socket.on('UPDATE_USERS', (usernames) => {
        console.log('UPDATE_USERNAMES', usernames);
        usernames.map((user) => {
            $('.users').append(`<li>${user}</li>`)
        })
    })

    function handleMessageForm(e) {
        e.preventDefault();
        msgButton.setAttribute('disabled', 'disbaled')

        const text = msgInput.value;
        if (text.length < 1) {
            return alert('No blank messages!')
        }
        const data = {
            text,
            sender: localStorage.getItem('name'),
        }
        socket.emit('NEW_MSG', data, () => {
            console.log('The message was delivered!')
            msgButton.removeAttribute('disabled')

        });
        msgInput.value = ''
        msgInput.focus();

    }

    function logout() {
        var name = localStorage.getItem('name')
        localStorage.removeItem('name');
        axios.post('/logout', { name })
            .then((res) => {
                alert(res.data);
            })
            .catch((err) => {
                console.log(err);
            })
        window.location = '/'
    }

}

const createMsg = (msg, sender) => {
    return {
        text: msg,
        sender,
        createdAt: moment().format('LT')
    }
}