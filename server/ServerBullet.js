var MovingEntity = require("./MovingEntity");
var Group = require("./CollisionGroup");
var ServerBulletEvents = require("./ServerBulletEvents");
var EntityEvents = require("./EntityEvents");
var GameServer = require("./GameServer");
var util = require("./util");
var p2 = require("p2");

function ServerBullet(bulletType, shooterId, localBulletId, x, y) {
  MovingEntity.call(this);
  this.alive = true; // set to FALSE when hits an enemy, etc.
  this.bulletType = bulletType;
  this.shooterId = shooterId; // entity that fired the bullet
  this.localBulletId = localBulletId;
  this.body.x = x;
  this.body.y = y;

  // configure collision of body, etc.
  var collisionGroup = Group.BULLETS;
  var collisionMask = Group.ACTORS | Group.BULLETS | Group.TILES;
  this.body.addBox(6, 6, collisionGroup, collisionMask);

  // pre-allocate this event
  this.bulletDestroyedEvent = new ServerBulletEvents.ServerBulletDestroyedEvent(this.localBulletId, this.shooterId);
}

ServerBullet.prototype = Object.create(MovingEntity.prototype);
ServerBullet.prototype.constructor = ServerBullet;

ServerBullet.prototype.impact = function() {
  this.body.velocity.x = 0;
  this.body.velocity.y = 0;
  GameServer.server.broadcastServerBulletDestroyed(this.bulletDestroyedEvent);
  this.willDestroy = true; // mark for deletion at tick finish
};

ServerBullet.prototype.collideWith = function(entity) {
  if (entity.id !== this.shooterId) {
    if (entity.constructor.name === "Player" && entity.isAlive) {
      var e = EntityEvents.EntityTookDamageEvent.fromBullet(this, entity);
      e = entity.takeDamage(e);
      GameServer.server.broadcastEntityTookDamage(e);
    }
    this.impact();
  }
};

ServerBullet.prototype.collideWithWall = function() {
  this.impact();
};

ServerBullet.EnumBulletTypes = {
  DEFAULT: 0,
  REVOLVER: 1,
  NAILGUN: 2,
};

ServerBullet.fromLocalBulletFiredEvent = function(shooterId, data) {
  var s = new ServerBullet(
    ServerBullet.EnumBulletTypes.REVOLVER,
    shooterId,
    data.localBulletId,
    data.x,
    data.y,
  );
  s.body.velocity.x = data.velocity.x;
  s.body.velocity.y = data.velocity.y;
  return s;
};

module.exports = ServerBullet;
