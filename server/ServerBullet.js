var MovingEntity = require("./MovingEntity");

var EnumBulletTypes = {
  DEFAULT: 0,
  REVOLVER: 1,
  NAILGUN: 2,
};

function ServerBullet(bulletType, shooterId, localBulletId, x, y) {
  MovingEntity.call(this);
  this.alive = true; // set to FALSE when hits an enemy, etc.
  this.bulletType = bulletType;
  this.shooterId = shooterId;
  this.localBulletId = localBulletId;
  this.x = x;
  this.y = y;

  // whether the obj has recently been changed and needs to resync w/ clients
  this.isDirty = true;

  this.snapshot = new BulletSnapshot(
    this.alive,
    this.bulletType,
    this.x,
    this.y,
    this.body.velocity[0],
    this.body.velocity[1],
    this.shooterId,
    this.localBulletId,
  );
}

ServerBullet.prototype = Object.create(MovingEntity.prototype);
ServerBullet.prototype.constructor = ServerBullet;

module.exports = ServerBullet;

function BulletSnapshot(
  alive,
  bulletType,
  x,
  y,
  velocityX,
  velocityY,
  shooterId,
  localBulletId
) {
  this.alive = alive;
  this.bulletType = bulletType; // enum bullet type
  this.x = x;
  this.y = y;
  this.velocity = {
    x: velocityX,
    y: velocityY,
  };

  this.shooterId = shooterId;
  this.localBulletId = localBulletId;
}

ServerBullet.prototype.getSnapshot = function() {
  this.isDirty = false;
  return {
    bulletType: this.bulletType,
    x: this.x,
    y: this.y,
    velocity: {
      x: this.body.velocity[0],
      y: this.body.velocity[1],
    },
    shooterId: this.shooterId,
    localBulletId: this.localBulletId,
  };
};
ServerBullet.prototype.syncWithSnapshot = function(clientBulletSnapshot) {
  this.isDirty = true;
  //sync to a client bullet snapshot.
  this.alive = clientBulletSnapshot.alive;
  this.x = clientBulletSnapshot.x;
  this.y = clientBulletSnapshot.y;
  this.body.velocity[0] = clientBulletSnapshot.velocity.x;
  this.body.velocity[1] = clientBulletSnapshot.velocity.y;
};
