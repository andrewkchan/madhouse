var Body = require("./Body");
var CollisionGroup = require("./CollisionGroup");
var GameServer = require("./GameServer");

// Serverside equivalent of client Actor.
// Basically just a physics body with some helper methods.
function MovingEntity(x, y) {
  this.id = GameServer.lastEntityId++;
  this.isAlive = false;
  this.body = (function() {
    var body = new Body(x, y);
    body.damping = 0; // no air resistance
    body.collisionResponse = false; // no contact forces

    GameServer.world.addBody(body);
    return body;
  })();
}

module.exports = MovingEntity;

MovingEntity.prototype.destroy = function() {
  GameServer.world.removeBody(this.body);
};
