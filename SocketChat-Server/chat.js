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
    *   ������ ä�� ������ ����
    */
    socket.on(USER_CONNECT, function (data) {
        currentUser.name = data.name;
        log('start','[' + data.name + '] connect chat Server');
        allUserList.push(currentUser.name);

        // ���� �������� ���� �������� ���� ������ �ѱ�
        for (var i = 0; i < allUserList.length; i++)
        {
            var playerData = {
                name: allUserList[i]
            };
            socket.emit(OTHER_USER_CONNECT, playerData);
            log('info', currentUser.name + ' emit: other_user_connect: ' + JSON.stringify(playerData));
        }

        // �ٸ� �����鿡�� �÷��̾ �����ߴٴ� ���� �˷���
        socket.broadcast.emit(OTHER_USER_CONNECT, currentUser);
    });

    /**
    *   ������ �޽����� ����
    */
    socket.on(SEND_MESSAGE, function (data) {
        log('message', currentUser.name + ' emit message: ' + data.message);
        socket.emit(RECEIVE_MESSAGE, { name: data.name, message: data.message });
        socket.broadcast.emit(RECEIVE_MESSAGE, { name: data.name, message: data.message });
    });

    /**
    *   ������ ������ ����
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