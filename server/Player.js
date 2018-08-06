var MovingEntity = require("./MovingEntity");
var GameServer = require("./GameServer");

function Player(name, socketId) {
  MovingEntity.call(this);
  this.name = name;
  this.isAlive = true;
  var startingPosition = GameServer.determineStartingPosition();
  this.body.x = startingPosition.x;
  this.body.y = startingPosition.y;
  this.currentStateName = "IDLE";
  this.cursorAngle = 0;
  this.socketId = socketId;
}

Player.prototype = Object.create(MovingEntity.prototype);
Player.prototype.constructor = Player;

module.exports = Player;

Player.prototype.destroy = function() {
  MovingEntity.prototype.destroy.call(this);
};
Player.prototype.getSnapshot = function() {
  // Trim player object to send to client
  return {
    id: this.id,
    name: this.name,
    x: this.body.x,
    y: this.body.y,
    velocity: {
      x: this.body.velocity[0],
      y: this.body.velocity[1],
    },
    currentStateName: this.currentStateName,
    cursorAngle: this.cursorAngle,
  };
};

Player.prototype.syncWithSnapshot = function(snapshot) {
  // sync to a client snapshot.
  this.body.x = snapshot.x;
  this.body.y = snapshot.y;
  this.body.velocity[0] = snapshot.velocity.x;
  this.body.velocity[1] = snapshot.velocity.y;

  this.currentStateName = snapshot.currentStateName;
  this.cursorAngle = snapshot.cursorAngle;
};
