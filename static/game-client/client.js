var Client = {};
Client.socket = io.connect();

Client.askNewPlayer = function() {
  Client.socket.emit("newplayer");
};

Client.socket.on("newplayer", function(data) {
  playState.addNewPlayer(data.id, data.x, data.y);
});

Client.socket.on("allplayers", function(data) {
  console.log(data);
  data.map(function(player) {
    playState.addNewPlayer(player.id, player.x, player.y);
  });
});

Client.socket.on("remove", function(data) {
  var id = data;
  playState.removePlayer(id);
});
