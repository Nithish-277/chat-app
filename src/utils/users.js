const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id,username,room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    const status = "online"

    // Validate the data

    if(!username || !room){
        return {
            error : 'Username and Room are required.'
        }
    }

    // Check for existing user

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })    

    // Validate username

    if(existingUser) {
        return {
            error : 'Username is in use.!'
        }
    }

    // Store user.

    const user = { id,username,room,status}
    users.push(user)
    return {
        user
    }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if(index !==-1){
        return users.splice(index,1)[0]
    }

}

const getUser = (id) => {
    const user = users.find((user) => {
        return user.id === id
    })

    if(!user) {
        return {
            error : 'User does not exists.!'
        }
    }

    return user

}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    const usersInroom = users.filter((user) => user.room === room)

    return usersInroom
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}