var Client = {
  INIT_EVENT_NAME: "init",
};
Client.socket = io.connect();

Client.askNewPlayer = function() {
  Client.socket.emit("ask-init");
};

Client.socket.on(Client.INIT_EVENT_NAME, function(data) {
  // This event triggers when receiving the initialization packet from the server, to use in playState.initWorld()
  Client.socket.emit('ponq', data.stamp); // send back a pong stamp to compute latency
  playState.initOwnPlayer(data);
  playState.beginSync();
});

Client.socket.on("update", function(data) {
  playState.processServerUpdate(data);
});

Client.socket.on("remove", function(data) {
  var id = data;
  playState.removePlayer(id);
});

//==================
// server event

Client.socket.on("entityTookDamage", function(data) {
  playState.onEntityTookDamage(data);
});
Client.socket.on("playerRespawned", function(data) {
  playState.onPlayerRespawned(data);
});
Client.socket.on("serverBulletFired", function(data) {
  playState.onServerBulletFired(data);
});
Client.socket.on("serverBulletDestroyed", function(data) {
  playState.onServerBulletDestroyed(data);
});
