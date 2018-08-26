var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var quickselect = require('quickselect'); // Used to compute the median for latency

var GameServer = require("./server/GameServer");
GameServer.server = server;

app.use('/static',express.static(__dirname + '/static'));

app.get('/',function(req,res){
  res.sendFile(__dirname+'/index.html');
});

server.listen(process.env.PORT || 8081, function(){
  console.log('Listening on '+ server.address().address + ":" + server.address().port);
  server.CLIENT_UPDATE_RATE = 1000/20.0; // rate at which update packets are sent
  GameServer.readMap();
  server.setUpdateLoop();
});

io.on("connection", function(socket) {
  console.log("Connection with id " + socket.id);
  console.log(server.getNumConnected() + " total connected");
  socket.pings = [];

  socket.on("ponq", function(sentStamp) {
    // Compute a running estimate of the latency of a client each time an interaction takes place between client and server
    // The running estimate is the median of the last 20 sampled values
    var ss = server.getShortStamp();
    var delta = (ss - sentStamp)/2;
    if(delta < 0) delta = 0;
    socket.pings.push(delta); // socket.pings is the list of the 20 last latencies
    if(socket.pings.length > 20) socket.pings.shift(); // keep the size down to 20
    socket.latency = quickMedian(socket.pings.slice(0)); // quickMedian used the quickselect algorithm to compute the median of a list of values
  });

  socket.on("clock-pinq", function(data) {
    socket.emit("clock-ponq", +Date.now());
  });

  socket.on("ask-init", function(data) {
    if (!GameServer.isMapLoaded) {
      socket.emit("wait");
      return;
    }
    if (!GameServer.isSocketIdFree(socket.id)) return;
    GameServer.addNewPlayer(socket, data);
  });

  socket.on("snapshot", function(data) {
    // recv client snapshot of client player.
    GameServer.processClientSnapshot(socket.id, data);
  });

  socket.on("disconnect", function() {
    console.log("Disconnection with socket ID " + socket.id);
    if (GameServer.getPlayerBySocketId(socket.id)) GameServer.removePlayerBySocketId(socket.id);
  });

  socket.on("localBulletFired", function(data) {
    var player = GameServer.getPlayerBySocketId(socket.id);
    if (player) {
      var serverBulletFiredEvent = GameServer.handleLocalBulletFired(player, data);
      if (serverBulletFiredEvent) socket.broadcast.emit("serverBulletFired", serverBulletFiredEvent);
    }
  });

  socket.on("localKatanaAttack", function(data) {
    var player = GameServer.getPlayerBySocketId(socket.id);
    if (player) {
      var serverKatanaAttackEvent = GameServer.handleLocalKatanaAttack(player, data);
      socket.broadcast.emit("serverKatanaAttack", serverKatanaAttackEvent);
    }
  });
});

server.addStamp = function(pkg) {
  pkg.stamp = server.getShortStamp();
  return pkg;
};

server.getNumConnected = function() {
  return Object.keys(GameServer.players).length;
};

server.getShortStamp = function() {
  return +Date.now();
}

server.getSocket = function(id) {
  return io.sockets.connected[id];
};

server.setUpdateLoop = function() {
  setInterval(GameServer.updateClients, server.CLIENT_UPDATE_RATE);
};

server.sendInitializationPacket = function(socket, packet) {
  packet = server.addStamp(packet);
  socket.emit("init", packet);
};

server.sendUpdate = function(socketId, packet) {
  packet = server.addStamp(packet);
  try {
    packet.latency = Math.floor(server.getSocket(socketId).latency);
  } catch(e) {
    console.log(e);
    packet.latency = 0;
  }
  io.in(socketId).emit("update", packet);
};

//===========================
// Server events

server.broadcastEntityTookDamage = function(packet) {
  packet = server.addStamp(packet);
  io.emit("entityTookDamage", packet);
};
server.broadcastServerBulletDestroyed = function(packet) {
  packet = server.addStamp(packet);
  io.emit("serverBulletDestroyed", packet);
};
server.broadcastPlayerRespawnedEvent = function(packet) {
  packet = server.addStamp(packet);
  io.emit("playerRespawned", packet);
};

function quickMedian(arr) {
  var  l = arr.length;
  var n = (l%2 == 0 ? (l/2)-1 : (l-1)/2);
  quickselect(arr,n);
  return arr[n];
};

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}
