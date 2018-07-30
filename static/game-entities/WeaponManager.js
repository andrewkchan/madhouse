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
WeaponManager.prototype.recoilWeaponHand = function(angle) {
  // override
  return;
};
WeaponManager.prototype.fire = function(input) {
  this.player._weapon.fireAtPointer(input.activePointer);
  this.recoilWeaponHand(GameInputUtil.getCursorAngle(input));
};
WeaponManager.prototype.update = function(angle, isVisible = true) {
  // override
  return;
};
