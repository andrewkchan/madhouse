// WeaponManager interface.

function WeaponManager(player) {
  this.player = player;
  player._weapon = game.add.weapon(0, "particle");
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
