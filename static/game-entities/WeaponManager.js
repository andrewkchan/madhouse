// WeaponManager interface.

function WeaponManager(player, name="DefaultWeapon") {
  this.player = player;
  this.player._weapon = game.add.weapon(0, "particle");

  this.player._weapon.onFire.add(this.onFire, this);
  this.bulletFiredEvent = new LocalBulletFiredEvent(0, 0, 0, 0);
  this.name = name;

  // ammo logic
  this.RELOAD_TIME = 0.1; // reload time in seconds
  this.reloadCountdown = 0.0; // set this to RELOAD_TIME to begin a reload
  this.CLIP_SIZE = 1;
  this.currentClip = this.CLIP_SIZE;
  this.reserveAmmo = 1;
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
  if (this.reloadCountdown > 0.0) {
    this.reloadCountdown -= game.time.physicsElapsed;
    if (this.reloadCountdown <= 0.0) {
      var ammoReloaded = Math.min(this.reserveAmmo, this.CLIP_SIZE - this.currentClip);
      this.currentClip += ammoReloaded;
      this.reserveAmmo -= ammoReloaded;
    }
  }
  return;
};
WeaponManager.prototype.onFire = function(bullet, weapon) {
  // called when the phaser weapon object successfully fires a single bullet
  this.bulletFiredEvent.syncWithBullet(bullet);
  if (this.player.isOwnPlayer) {
    // only emit own player's local fire events
    Client.socket.emit("localBulletFired", this.bulletFiredEvent);
    // other clients must populate bullet map by receiving server events.
    // here, we can populate the bullet map with our local event.
    this.player.bulletMap[this.bulletFiredEvent.localBulletId] = bullet;
  }
};
WeaponManager.prototype.tryReload = function() {
  // override
  return;
};

WeaponManager.constructorFromWeaponName = function(weaponName) {
  return {
    "DefaultWeapon": WeaponManager,
    "Revolver": RevolverManager,
    "Nailgun": NailgunManager,
    "DualUzi": DualUziManager,
    "Katana": KatanaManager,
  }[weaponName] || WeaponManager;
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
