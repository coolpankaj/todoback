/**
 * modules dependencies.
 */
const socketio = require('socket.io');

const tokenLib = require('./tokenLib');

const redisLib = require("./redisLib");


let setServer = (server) => {

    let io = socketio.listen(server);
    let myIo = io.of('/')
    
    myIo.on('connection', (socket) => {

        console.log("on connection--emitting verify user");

        socket.emit("verifyUser", "");
           /**
         * @api {emit} verifyUser verify user
         * @apiVersion 1.0.0
         * @apiGroup Emit 
         *@apiDescription This event is emmited to verify asking user to verify itself.
        */
        console.log('verify-user emitted from backend')

        // code to verify the user and make him online

        socket.on('set-user', (authToken) => {
    /**
     * @api {listen} set-user Setting user online
     * @apiVersion 1.0.0
     * @apiGroup Listen 
     *@apiDescription This eventListner listens to user for authToken verification
    */


            console.log("set-user called")
            tokenLib.verifyClaimWithoutSecret(authToken, (err, user) => {
                if (err) {
                    socket.emit('auth-error', { status: 500, error: 'Please provide correct auth token' })
            /**
             * @api {emit} auth-error emit authentication error
             * @apiVersion 1.0.0
             * @apiGroup Emit 
             *@apiDescription This event is emmited when the auth token provided by user cannot be verified
            */
                }
                else {

                    console.log("user is verified..setting details");
                    let currentUser = user.data;
                    // setting socket user id 
                    socket.userId = currentUser.userId
                    let fullName = `${currentUser.firstName} ${currentUser.lastName}`
                    let key = currentUser.userId
                    let value = fullName

                    let setUserOnline = redisLib.setANewOnlineUserInHash("onlineUsersListToDo", key, value, (err, result) => {
                        if (err) {
                            console.log(`some error occurred`)
                        } else {
                            // getting online users list.

                            redisLib.getAllUsersInAHash('onlineUsersListToDo', (err, result) => {
                                console.log(`--- inside getAllUsersInAHas function ---`)
                                if (err) {
                                    console.log(err)
                                } else {

                                    console.log(`${fullName} is online`);
                                    
                                    
 
                                    socket.broadcast.emit('online-user-list', result);
                             /**
                             * @api {emit} auth-error broadcast users online
                             * @apiVersion 1.0.0
                             * @apiGroup Emit 
                             *@apiDescription This broadcast event is emited to indicate the online users
                            */
                                }
                            })
                        }
                    })

                }
            })

        }) // end of listening set-user event


        socket.on('disconnect', () => {
            
             /**
             * @api {listen} disconnect to disconnect from socket
             * @apiVersion 1.0.0
             * @apiGroup Listen 
             *@apiDescription This eventListner is listens to disconnect event to disconnect from socket
            */
            console.log("user is disconnected");

            if (socket.userId) {
                redisLib.deleteUserFromHash('onlineUsersListToDo', socket.userId)
                redisLib.getAllUsersInAHash('onlineUsersListToDo', (err, result) => {
                    if (err) {
                        console.log(err)
                    } else {
                        //socket.to(socket.room).broadcast.emit('online-user-list', result);
                        socket.broadcast.emit('online-user-list', result);
                    }
                })
            }

        }) // end of on disconnect


        socket.on('notify-updates', (data) => {
               /**
             * @api {listen} notify-updates notification
             * @apiVersion 1.0.0
             * @apiGroup Listen 
             *@apiDescription This eventListner listens to updates from client
            */
            console.log("socket notify-updates called")
            console.log(data);
            socket.broadcast.emit(data.userId, data);
        });
    });
}

module.exports = {
    setServer: setServer
}
