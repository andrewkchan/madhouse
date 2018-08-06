var MovingEntity = require("./MovingEntity");

var EnumBulletTypes = {
  DEFAULT: 0,
  REVOLVER: 1,
  NAILGUN: 2,
};

function ServerBullet(bulletType, shooterId, localBulletId, x, y) {
  MovingEntity.call(this);
  this.bulletType = bulletType;
  this.shooterId = shooterId;
  this.localBulletId = localBulletId;
  this.x = x;
  this.y = y;

  // whether the obj has recently been changed and needs to resync w/ clients
  this.isDirty = true;
}

ServerBullet.prototype = Object.create(MovingEntity.prototype);
ServerBullet.prototype.constructor = ServerBullet;

module.exports = ServerBullet;

ServerBullet.prototype.getSnapshot = function() {
  this.isDirty = false;
  return {
    bulletType: this.bulletType,
    x: this.x,
    y: this.y,
    velocity: {
      x: this.body.velocity.x,
      y: this.body.velocity.y,
    },
    shooterId: this.shooterId,
    localBulletId: this.localBulletId,
  };
};
ServerBullet.prototype.syncWithSnapshot = function(clientBulletSnapshot) {
  this.isDirty = true;
  //sync to a client bullet snapshot.
  this.x = clientBulletSnapshot.x;
  this.y = clientBulletSnapshot.y;
  this.body.velocity[0] = clientBulletSnapshot.velocity.x;
  this.body.velocity[1] = clientBulletSnapshot.velocity.y;
};
