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

Client.socket.on("serverBulletFired", function(data) {
  console.log("serverBulletFired", data);
});
