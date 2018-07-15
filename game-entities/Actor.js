// Actor is the topmost class encompassing all "living" sprites, be it players, NPC or monsters (not items)
function Actor(name, x, y, key) {
  // key is the string indicating which atlas to use
  Phaser.Sprite.call(this, game, x, y, key); // Call to constructor of parent
  game.add.existing(this);
  this.alive = true;
  this.name = name;
}
Actor.prototype = Object.create(Phaser.Sprite.prototype); // Declares the inheritance relationship
Actor.prototype.constructor = Actor;

Actor.prototype.takeDamage = function(dmg) {
  Phaser.sprite.damage.call(this, dmg);
};
