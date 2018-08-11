// WeaponManager interface.

function WeaponManager(player, name="DefaultWeapon") {
  this.player = player;
  player._weapon = game.add.weapon(0, "particle");

  this.player._weapon.onFire.add(this.onFire, this);
  this.bulletFiredEvent = new LocalBulletFiredEvent(0, 0, 0, 0);
  this.name = name;
}

WeaponManager.prototype = Object.create({});
WeaponManager.prototype.constructor = WeaponManager;
WeaponManager.prototype.destroy = function() {
  this.player._weapon.destroy();
};
WeaponManager.prototype.initBackgroundAnims = function() {
  // override
  return;
}
WeaponManager.prototype.initForegroundAnims = function() {
  // override
  return;
}
WeaponManager.prototype.recoilWeaponHand = function(angle) {
  // override
  return;
};
WeaponManager.prototype.fire = function(input) {
  // called on fire start.
  // for semi-auto weapons, fire once.
  // automatic weapons should override this method.
  this.player._weapon.fireAtPointer(input.activePointer);
  this.recoilWeaponHand(GameInputUtil.getCursorAngle(input));
};
WeaponManager.prototype.fireStop = function(input) {
  // override
  return;
};
WeaponManager.prototype.update = function(angle, isVisible = true) {
  // override
  return;
};
WeaponManager.prototype.onFire = function(bullet, weapon) {
  // called when the phaser weapon object successfully fires a single bullet
  this.bulletFiredEvent.syncWithBullet(bullet);
  Client.socket.emit("localBulletFired", this.bulletFiredEvent);
  console.log("Emitting localBulletFired", this.bulletFiredEvent);
};

function LocalBulletFiredEvent(
  x,
  y,
  velocityX,
  velocityY,
  initId = 0,
) {
  this.x = x;
  this.y = y;
  this.velocity = {
    x: velocityX,
    y: velocityY,
  };
  this.localBulletId = initId;
  // timestamp?
};

LocalBulletFiredEvent.prototype.syncWithBullet = function(bullet) {
  this.x = bullet.x;
  this.y = bullet.y;
  this.velocity.x = bullet.body.velocity.x;
  this.velocity.y = bullet.body.velocity.y;
  this.localBulletId++;
};
