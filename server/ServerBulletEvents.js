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
  this.x = bullet.x;
  this.y = bullet.y;
  this.velocity.x = bullet.body.velocity[0];
  this.velocity.y = bullet.body.velocity[1];
  this.shooterId = bullet.shooterId;
  this.localBulletId = bullet.localBulletId;
};

module.exports.ServerBulletFiredEvent = ServerBulletFiredEvent;
