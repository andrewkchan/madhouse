var MovingEntity = require("./MovingEntity");
var Group = require("./CollisionGroup");
var util = require("./util");
var p2 = require("p2");

function ServerBullet(bulletType, shooterId, localBulletId, x, y) {
  MovingEntity.call(this);
  this.alive = true; // set to FALSE when hits an enemy, etc.
  this.bulletType = bulletType;
  this.shooterId = shooterId; // entity that fired the bullet
  this.localBulletId = localBulletId;
  this.x = x;
  this.y = y;

  // configure collision of body, etc.
  var collisionGroup = Group.BULLETS;
  var collisionMask = Group.ACTORS | Group.BULLETS | Group.TILES;
  this.body.addBox(6, 6, collisionGroup, collisionMask);
}

ServerBullet.prototype = Object.create(MovingEntity.prototype);
ServerBullet.prototype.constructor = ServerBullet;

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
