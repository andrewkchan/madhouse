var util = require("./util");

function ServerBulletFiredEvent(
  x,
  y,
  velocityX,
  velocityY,
  localBulletId,
  shooterId,
) {
  this.x = x;
  this.y = y;
  this.velocity = {
    x: velocityX,
    y: velocityY,
  };
  this.localBulletId = localBulletId;
  this.shooterId = shooterId;
  // timestamp?
};

ServerBulletFiredEvent.prototype.syncWithBullet = function(bullet) {
  this.x = bullet.body.x;
  this.y = bullet.body.y;
  this.velocity.x = bullet.body.velocity.x;
  this.velocity.y = bullet.body.velocity.y;
  this.shooterId = bullet.shooterId;
  this.localBulletId = bullet.localBulletId;
};

function ServerBulletDestroyedEvent(localBulletId, shooterId) {
  this.localBulletId = localBulletId;
  this.shooterId = shooterId;
}

module.exports.ServerBulletFiredEvent = ServerBulletFiredEvent;
module.exports.ServerBulletDestroyedEvent = ServerBulletDestroyedEvent;
