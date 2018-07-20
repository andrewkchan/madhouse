function RevolverBullet(game, x, y) {
  Phaser.Bullet.call(this, game, x, y, "particle_sm", 0);
  this._light = this.addChild(game.make.sprite(0, 0, 'particle_overlay'));
  this._light.anchor.setTo(0.5, 0.5);
  this._light.blendMode = PIXI.blendModes.OVERLAY;
}
RevolverBullet.prototype = Object.create(Phaser.Bullet.prototype);
RevolverBullet.prototype.constructor = RevolverBullet;
RevolverBullet.prototype.collideWith = function(actor) {
  actor.takeDamage(10);
};
