function RevolverBullet(shooterId, game, x, y) {
  ClientBullet.call(this, shooterId, game, x, y);
  this.bulletType = EnumBulletTypes.REVOLVER;
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
  this.penetrations = 1; // number of enemies it can penetrate
}
RevolverBullet.prototype = Object.create(ClientBullet.prototype);
RevolverBullet.prototype.constructor = RevolverBullet;
RevolverBullet.prototype.collideWith = function(actor) {
  if (this.penetrations > 0) {
      actor.takeDamage(10);
      this.penetrations -= 1;
  }
};
RevolverBullet.prototype.impact = function() {
  this.body.velocity.x = 0;
  this.body.velocity.y = 0;

  this._impact.visible = true;
  // this._impact_light.visible = true;
  this._impact.animations.play('impact');
  this.isDirty = true;
  this._impact.animations.currentAnim.onComplete.addOnce(function() {
    this.kill();
    this._impact.visible = false;
    // this._impact_light.visible = false;
    this.penetrations = 1;
  }, this);
};
