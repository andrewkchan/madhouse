function RevolverBullet(game, x, y) {
  Phaser.Bullet.call(this, game, x, y, "particle_sm", 0);
  this._light = this.addChild(game.make.sprite(0, 0, 'particle_overlay'));
  this._light.anchor.setTo(0.5, 0.5);
  this._light.blendMode = PIXI.blendModes.OVERLAY;
  // this._impact_light = this.addChild(game.make.sprite(0, 0, 'particle_overlay_red_lg'));
  // this._impact_light.anchor.setTo(0.5, 0.5);
  // this._impact_light.blendMode = PIXI.blendModes.SCREEN;
  // this._impact_light.visible = false;
  this._impact = this.addChild(game.make.sprite(0, 0, 'particle_sm_impact'));
  this._impact.anchor.setTo(0.5, 0.5);
  this._impact.animations.add('impact', [0, 1, 2], 20, false);
  this._impact.visible = false;

}
RevolverBullet.prototype = Object.create(Phaser.Bullet.prototype);
RevolverBullet.prototype.constructor = RevolverBullet;
RevolverBullet.prototype.collideWith = function(actor) {
  actor.takeDamage(10);
};
RevolverBullet.prototype.impact = function() {
  this.body.velocity.x = 0;
  this.body.velocity.y = 0;

  this._impact.visible = true;
  // this._impact_light.visible = true;
  this._impact.animations.play('impact');
  this._impact.animations.currentAnim.onComplete.addOnce(function() {
    this.kill();
    this._impact.visible = false;
    // this._impact_light.visible = false;
  }, this);
};
