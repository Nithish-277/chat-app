const socket = io()

var typing = false
var timeout = false

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')  
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

// typing.. feature

// $(document).ready(function(){
//     console.log('Key Pressed')
//     $('#message-box').keypress((e)=>{
//       if(e.which!=13){
//         typing=true
//         socket.emit('typing', {user:user, typing:true})
//         clearTimeout(timeout)
//         timeout=setTimeout(typingTimeout, 3000)
//       }else{
//         clearTimeout(timeout)
//         typingTimeout()
//         //sendMessage() function will be called once the user hits enter
//         sendMessage()
//       }
//     })

//     //code explained later
//     socket.on('display', (data)=>{
//       if(data.typing==true)
//         $('.typing').text(`${data.user} is typing...`)
//       else
//         $('.typing').text("")
//     })
// })


$(document).ready(function () {
    var message = $("#message-box")

    var feedback = $("#feedback")

    message.bind('keypress',(e) => {
        console.log('Key pressed')
        if(e.which!=13){
            typing = true
            socket.emit('typing',{typing:true})
            clearTimeout(timeout)
            timeout = setTimeout(typingTimeout,1500)
        } else {
            clearTimeout(timeout)
            typingTimeout()
        }
    })

    socket.on('display',(data) => {

        if(data.typing)
            feedback.html("<p><b><i>" + data.username + " is typing..." + "</i></b></p>")
        else
            feedback.html("");
        // feedback.html("")
        // setTimeout(() => {
        //     feedback.html("");
        //   }, 2000);
        // console.log('In typing socket')
    })
})

function typingTimeout(){
    typing=false
    socket.emit('typing', {typing:false})
}