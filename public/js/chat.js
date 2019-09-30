const socket = io();

//Components
const msgButton = document.querySelector('#msgBtn');
const msgForm = document.querySelector('.msgForm');
const msgInput = document.querySelector('#messageInput');
const messages = document.querySelector('.main-messages');
const userList = document.querySelector('.users');

//Template
const msgTemp = document.querySelector('#msgTemp').innerHTML;
const usersTemp = document.querySelector('#usersTemp').innerHTML;

if (localStorage.getItem('name') === null) {
    alert('No user logged in. Please login to use ChatApp');
    window.location = '/'
}
else {
    const autoScroll = () => {
        //new msg elem
        const newMsg = messages.lastElementChild;
        // console.log(newMsg);

        //height of newMsg
        const newMsgStyles = getComputedStyle(newMsg);
        const newMsgMargin = parseInt(newMsgStyles.marginBottom);
        const newMsgHeight = newMsg.offsetHeight + newMsgMargin

        //visible height
        const visibleHeight = messages.offsetHeight;

        //height of messages
        const contentHeight = messages.scrollHeight;
        console.log(visibleHeight, contentHeight);

        //how far i've scrolled
        const scrollOffset = messages.scrollTop + visibleHeight;

        if (contentHeight - newMsgHeight <= scrollOffset) {
            messages.scrollTop = messages.scrollHeight;
        }
    }

    //WELCOME MESSAGE
    socket.on('GREET_MSG', (msg) => {
        console.log(msg);
    })

    //MESSAGE
    socket.on('MESSAGE', (msg) => {
        const html = Mustache.render(msgTemp, { msg });
        messages.insertAdjacentHTML('beforeend', html);
        autoScroll();
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
            sender: localStorage.getItem('name')
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
                let newUsers = res.data.users;
                // console.log(newUsers);
                socket.emit('UPDATE_USERS', newUsers);
                alert(res.data.info);
            })
            .catch((err) => {
                console.log(err);
            })
        window.location = '/'
    }

}