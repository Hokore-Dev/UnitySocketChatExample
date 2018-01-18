var io = require('socket.io')({
	transports: ['websocket'],
});

io.attach(4567);

io.on('connection', function(socket){
    socket.on('beep', function () {
        console.log("deep");
		socket.emit('boop');
	});
})

console.log("server started");