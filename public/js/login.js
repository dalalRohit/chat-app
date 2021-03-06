const socket = io();
const usernameInput = document.querySelector('#username');
const error = document.querySelector('.error');
error.style.display = 'none';

function handleForm(e) {
    e.preventDefault();
    var username = usernameInput.value.toLowerCase();

    if (username.length < 1) {
        error.innerHTML = 'Username is needed!';
        return error.style.display = 'block';

    }
    if (username.indexOf('_') !== -1) {
        axios.post('/verify', { username, socketId: socket.id })
            .then((res) => {
                let response = res.data;
                if (typeof response === 'string') {
                    error.style.display = 'block'
                    error.innerHTML = response;
                    return console.log(response);
                }
                else {
                    usernameInput.value = '';
                    socket.emit('USER_CONNECTED', response.user);
                    localStorage.setItem('name', response.user.name)
                    window.location = '/chat'
                }

            })
            .catch((err) => {
                return console.log(err);
            })
    }
    else {
        error.style.display = 'block'
        error.innerHTML = `Enter username in [name_surname] formart!`;
    }


}