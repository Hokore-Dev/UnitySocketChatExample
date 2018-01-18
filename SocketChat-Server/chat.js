var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

io.attach(4567);

var allUserList = [];

const CONNECT               = "connect";
const DISCONNECT            = "disconnect";
const USER_CONNECT          = "user_connect";
const OTHER_USER_CONNECT    = "other_user_connect";

io.on('connection', function(socket){
    var currentUser = {};
    currentUser.name = 'unknown';

    /**
    *   유저가 채팅 서버에 접속
    *   emit: name
    */
    socket.on(USER_CONNECT, function (data) {
        currentUser.name = data;
        console.log('[' + data.name + '] connect chat Server');

        // 다른 유저들에게 플레이어가 접속했다는 것을 알려줌
        for (var i = 0; i < allUserList.length; i++)
        {
            var playerData = {
                name: data.name
            };
            socket.emit(OTHER_USER_CONNECT, playerData);
            console.log(currentUser.name + ' emit: other_user_connect: ' + JSON.stringify(playerData));
        }
    });

    
})

app.get('/', function (req, res) {
    res.send(JSON.stringify(allUserList));
})

console.log("server started");