var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/static',express.static(__dirname + '/static'));

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

server.lastPlayerId = 0; // track last Id assigned to a player

server.listen(process.env.PORT || 8081,function(){
    console.log('Listening on '+server.address().port);
});

io.on("connection", function(socket) {
  socket.on("newplayer", function() {
    socket.player = {
      id: server.lastPlayerId++,
      x: randomInt(100, 200),
      y: randomInt(100, 200),
    };
    // emit the current list of players to the current client
    socket.emit("allplayers", getAllPlayers());

    // broadcast the new player object to all existing clients
    // (not including the current client)
    socket.broadcast.emit("newplayer", socket.player);

    socket.on("disconnect", function() {
      io.emit("remove", socket.player.id);
    });
  });
});

function getAllPlayers() {
  var players = [];
  Object.keys(io.sockets.connected).forEach(function(socketId) {
    var player = io.sockets.connected[socketId].player;
    if (player) players.push(player);
  });
  return players;
}

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}
