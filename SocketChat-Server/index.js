var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);

// global variables for the server
var enemies = [];
var playerSpawnPoints = [];
var clients = [];

app.get('/', function (req, res) {
    res.send('hey you get back get "/"');
})

io.on('connection', function(socket)
{
    var currentPlayer = {};
    currentPlayer.name = 'unknown';

    socket.on('player connect', function () {
        console.log(currentPlayer.name + ' recv player connect');
        for (var i = 0; i < clients.length; i++)
        {
            var playerConnected = {
                name:clients[i].name,
                position:clients[i].position,
                rotation:clients[i].position,
                health:clients[i].health
            };
            // 플레이어가 접속했을때 다른 플레이어들에게 알려줌
            socket.emit('other player connected', playerConnected);
            console.log(currentPlayer.name + ' emit: other player connected: ' + JSON.stringify(playerConnected));
        }
    })

    socket.on('play', function (data) {
        console.log(currentPlayer.name + ' recv: play: ' + JSON.stringify(data));
        if (clients.length === 0)
        {
            numberOfEnemies = data.enemySpawnPoints.length;
            enemies = [];
            data.enemySpawnPoints.forEach(function (enemySpawnPoint) {
                var enemy =
                    {
                        name: guid(),
                        position: enemySpawnPoint.position,
                        rotation: enemySpawnPoint.rotation,
                        health: 100
                    };
                enemies.push(enemy);
            });
            playerSpawnPoints = [];
            data.playerSpawnPoints.forEach(function (_playerSpawnPoint) {
                var playerSpawnPoint = {
                    position: _playerSpawnPoint.position,
                    rotation: _playerSpawnPoint.rotation,
                };
                playerSpawnPoints.push(playerSpawnPoint);
            })
        }

        var enemiesResponse = {
            enemies: enemies
        };

        // 플레이어에게 적의 정보를 보냄
        console.log(currentPlayer.name + ' emit: enemies: ' + JSON.stringify(enemiesResponse));
        socket.emit('enemies', enemiesResponse);
        var randomSpawnPoint = playerSpawnPoints[Math.floor(Math.random() * playerSpawnPoints.length)];
        currentPlayer = {
            name: data.name,
            position: randomSpawnPoint.position,
            rotation: randomSpawnPoint.rotation,
            health: 100
        };
        clients.push(currentPlayer);

        // 들어왔다고 플레이어에게 알림
        console.log(currentPlayer.name + ' emit: play: ' + JSON.stringify(currentPlayer));
        socket.emit('play', currentPlayer);

        // 다른 플레이어에게 유저의 정보를 알림
        socket.broadcast.emit('other player connected', currentPlayer);
    });

    socket.on('player move', function (data) {
        console.log('recv: move: ' + JSON.stringify(data));
        currentPlayer.position = data.position;
        socket.broadcast.emit('player move', currentPlayer);
    });

    socket.on('player turn', function (data)
    {
        console.log('recv: turn: ' + JSON.stringify(data));
        currentPlayer.rotation = data.rotation;
        socket.broadcast.emit('player turn', currentPlayer);
    })

    socket.on('player shoot', function (data) {
        console.log(currentPlayer.name + 'recv: shoot');
        var data = {
            name: currentPlayer.name
        };
        console.log(currentPlayer.name + ' bcst: shoot' + JSON.stringify(data));
        socket.emit('player shoot', data);
        socket.broadcast.emit('player shoot', data);
    });

    socket.on('health', function (data) {
        console.log(currentPlayer.name + ' recv: health: ' + JSON.stringify(data));
        if (data.from === currentPlayer.name)
        {
            // 자신이 쏜 총알이면 데미지는 0
            var indexDamaged = 0;
            if (!data.isEnemy)
            {
                clients = clients.map(function (client, index) {
                    if (clients.name === data.name)
                    {
                        indexDamaged = index;
                        client.health -= data.healthChange;
                    }
                    return client;
                });
            }
            else {
                enemies = enemies.map(function (enemy, index) {
                    if (enemy.name === data.name)
                    {
                        indexDamaged = index;
                        enemy.health -= data.healthChange;
                    }
                    return enemy;
                });
            }

            var response = {
                name: (!data.isEnemy) ? clients[indexDamaged].name : enemies[indexDamaged].name,
                health: (!data.isEnemy) ? clients[indexDamaged].health : enemies[indexDamaged].health
            };
            console.log(currentPlayer.name + ' bcst: health: ' + JSON.stringify(data));
            socket.emit('player shoot', data);
            socket.broadcast.emit('player shoot', data);
        }
    });

    socket.on('disconnect', function () {
        console.log(currentPlayer.name + ' recv: disconnect ' + currentPlayer.name);
        socket.broadcast.emit('other player disconnected', currentPlayer);
        console.log(currentPlayer.name + ' bcst: other player disconnected' + JSON.stringify(currentPlayer));
        for (var i = 0; i < clients.length; i++)
        {
            if (clients[i].name === currentPlayer.name)
            {
                clients.splice(i, 1);
            }
        }
    });
});

console.log('--- server is running ...' + guid());

function guid() 
{
    function s4() 
    {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}