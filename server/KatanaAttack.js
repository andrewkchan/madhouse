var MovingEntity = require("./MovingEntity");
var Group = require("./CollisionGroup");
var ServerBulletEvents = require("./ServerBulletEvents");
var EntityEvents = require("./EntityEvents");
var GameServer = require("./GameServer");


// KatanaAttack objects are very similar to a bullet and should be added to the player bulletMap.
// for example, bullets collide with entities and are automatically removed if marked willBeDestroyed
// at the end of each update.
// there are some events that we need to change, e.g. we should not be sending bullet destroyed events
// because katana attacks are only simulated on the server and not the client.
function KatanaAttack(angle, shooter) {
  MovingEntity.call(this);
  this.alive = true; // set to FALSE when hits an enemy, etc.
  this.shooterId = shooter.id; // entity that fired the KatanaAttack
  this.shooter = shooter;
  this.body.x = shooter.body.x;
  this.body.y = shooter.body.y;

  // configure collision of body, etc.
  var collisionGroup = Group.BULLETS;
  var collisionMask = Group.ACTORS | Group.BULLETS | Group.TILES;
  this.body.addTriangle(40, angle, collisionGroup, collisionMask);

  this.tickLifetime = 3;
}

KatanaAttack.prototype = Object.create(MovingEntity.prototype);
KatanaAttack.prototype.constructor = KatanaAttack;

KatanaAttack.prototype.impact = function() {
  this.alive = false;
  this.willDestroy = true; // mark for deletion at tick finish
};
KatanaAttack.prototype.collideWith = function(entity) {
  if (entity.id !== this.shooterId) {
    if (entity.constructor.name === "Player" && entity.isAlive) {
      var e = EntityEvents.EntityTookDamageEvent.fromKatanaAttack(this, entity);
      e = entity.takeDamage(e);
      GameServer.server.broadcastEntityTookDamage(e);
    }
  }
};
KatanaAttack.prototype.update = function() {
  this.body.x = this.shooter.body.x;
  this.body.y = this.shooter.body.y;
  if (this.tickLifetime > 0) {
    this.tickLifetime--;
  } else {
    this.impact();
  }

};


module.exports = KatanaAttack;
