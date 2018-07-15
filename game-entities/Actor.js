var FLASH_FRAMES = 5; // frames between flashes for flashing actors

// Actor is the topmost class encompassing all "living" sprites, be it players, NPC or monsters (not items)
function Actor(name, x, y, key) {
  // key is the string indicating which atlas to use
  Phaser.Sprite.call(this, game, x, y, key); // Call to constructor of parent
  game.add.existing(this);
  this.alive = true;
  this.name = name;
  // vars for flashing across frames
  this.flashTime = 0.0; // time to flash in seconds
  this.flashCountdown = FLASH_FRAMES;
}
Actor.prototype = Object.create(Phaser.Sprite.prototype); // Declares the inheritance relationship
Actor.prototype.constructor = Actor;

Actor.prototype.update = function() {
  if (this.flashTime > 0.0) {
    this.flashTime -= game.time.physicsElapsed;
    this.flashCountdown = (this.flashCountdown > 0) ? this.flashCountdown - 1 : FLASH_FRAMES;
  }
  // if flashtime is positive, flash when countdown is zero
  this.flash(this.flashTime > 0.0 && this.flashCountdown === 0);
};
Actor.prototype.takeDamage = function(dmg) {
  Phaser.Sprite.prototype.damage.call(this, dmg);
};
Actor.prototype.flashForSeconds = function(secs) {
  this.flashTime = secs;
};
Actor.prototype.flash = function(isFlashing) {
  return;
};
