var Body = require("./Body");
var CollisionGroup = require("./CollisionGroup");
var GameServer = require("./GameServer");

// Serverside equivalent of client Actor.
// Basically just a physics body with some helper methods.
function MovingEntity(x, y) {
  this.id = GameServer.lastEntityId++;
  this.isAlive = false;
  var self = this;
  this.body = (function() {
    var body = new Body(self, x, y);
    body.damping = 0; // no air resistance
    body.collisionResponse = false; // no contact forces

    GameServer.world.addBody(body);
    return body;
  })();
  this.willDestroy = false; // flag for deletion on tick finish
}

module.exports = MovingEntity;

MovingEntity.prototype.destroy = function() {
  GameServer.world.removeBody(this.body);
};

MovingEntity.prototype.collideWith = function(entity) {
  // override
  return;
};
MovingEntity.prototype.collideWithWall = function() {
  // override
  return;
};
MovingEntity.prototype.update = function() {
  //override
  return;
};
MovingEntity.prototype.toString = function() {
  return `[${this.constructor.name}::(${this.body.x}, ${this.body.y}) id:${this.id}, willDestroy:${this.willDestroy}]`;
};
