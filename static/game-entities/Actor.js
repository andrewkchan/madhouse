var FLASH_FRAMES = 5; // frames between flashes for flashing actors

// Actor is the topmost class encompassing all "living" sprites, be it players, NPC or monsters (not items)
function Actor(id, name, x, y, key) {
  // key is the string indicating which atlas to use
  Phaser.Sprite.call(this, game, x, y, key); // Call to constructor of parent
  game.add.existing(this);
  this.id = id; // server-defined actor ID
  this.alive = true;
  this.name = name;
  this.speed = 70;
  // vars for flashing across frames
  this.flashTime = 0.0; // time to flash in seconds
  this.flashCountdown = FLASH_FRAMES;
  // AI stuff
  this.botControlled = false;
  this.currentTarget = null;
  this.path = null;
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

  if (this.botControlled && this.alive) {
    if (this.currentTarget) {
      this.moveTowards(this.currentTarget);

      // Check if reached vicinity of target
      if (this.position.distance(this.currentTarget) < 5) {
        // If there is still path left, keep going. Else null the target
        if (this.path.length > 0) {
          this.currentTarget = this.path.shift();
        }
        else this.currentTarget = null;
      }
    }
  }
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
Actor.prototype.goTo = function(navMesh, targetPoint) {
  // finds a quick path to a point and begins navigation to that point
  this.path = navMesh.findPath(this.position, targetPoint);

  // if valid path, grab first point and begin moving toward it
  if (this.path && this.path.length > 0) {
    //this.path.shift(); // first node in the path is always the current position
    this.currentTarget = this.path.shift();
  }
  else this.currentTarget = null;
}
Actor.prototype.moveTowards = function(target) {
  // should be overriden by children.
  return;
};
Actor.prototype.collideWith = function(entity) {
  // override
  return;
}
