var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var log = require('./lib/log.js');

io.attach(3000);

var allUserList = [];

const CONNECT               = "connect";
const DISCONNECT            = "disconnect";
const USER_CONNECT          = "user_connect";
const SEND_MESSAGE          = "send_message";
const RECEIVE_MESSAGE       = "receive_message";
const OTHER_USER_CONNECT    = "other_user_connect";
const OTHER_USER_DISCONNECT = "other_user_disconnect";

io.on('connection', function(socket){
    var currentUser = {};
    currentUser.name = 'unknown';

    /**
    *   유저가 채팅 서버에 접속
    */
    socket.on(USER_CONNECT, function (data) {
        currentUser.name = data.name;
        log('start','[' + data.name + '] connect chat Server');
        allUserList.push(currentUser.name);

        // 현재 유저에게 현재 접속중인 유저 정보를 넘김
        for (var i = 0; i < allUserList.length; i++)
        {
            var playerData = {
                name: allUserList[i]
            };
            socket.emit(OTHER_USER_CONNECT, playerData);
            log('info', currentUser.name + ' emit: other_user_connect: ' + JSON.stringify(playerData));
        }

        // 다른 유저들에게 플레이어가 접속했다는 것을 알려줌
        socket.broadcast.emit(OTHER_USER_CONNECT, currentUser);
    });

    /**
    *   유저가 메시지를 보냄
    */
    socket.on(SEND_MESSAGE, function (data) {
        log('message', currentUser.name + ' emit message: ' + data.message);
        socket.emit(RECEIVE_MESSAGE, { name: data.name, message: data.message });
        socket.broadcast.emit(RECEIVE_MESSAGE, { name: data.name, message: data.message });
    });

    /**
    *   유저가 접속을 끊음
    */
    socket.on(DISCONNECT, function () {
        log('stop', currentUser.name + ' recv: disconnect');
        socket.broadcast.emit(OTHER_USER_DISCONNECT, currentUser);
        for (var i = 0 ; i < allUserList.length;i++)
        {
            if (allUserList[i] === currentUser.name)
            {
                allUserList.splice(i, 1);
            }
        }
    });
    
})

app.get('/', function (req, res) {
    res.send(JSON.stringify(allUserList));
})

log('start'," ===== Server Started ======");