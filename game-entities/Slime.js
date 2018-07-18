REPATH_FRAMES = 30;

function Slime(player) {
  Actor.call(this, 'slime', 0, 0, 'slime');
  SlimeAnimUtil.initSpriteWithAnims(this);
  SlimeBodyUtil.initSpriteWithBody(game, this);
  this.health = 100;
  this.botControlled = true;
  this.speed = 40;
  // AI stuff
  this.navMesh = null;
  this.player = player;
  this.repathCountdown = REPATH_FRAMES;
}
Slime.prototype = Object.create(Actor.prototype);
Slime.prototype.constructor = Slime;

Slime.prototype.update = function() {
  Actor.prototype.update.call(this);
  if (this.repathCountdown === 0) {
    if (this.navMesh) {
      this.goTo(this.navMesh, this.player.position);
      // this.navMesh.debugDrawClear();
      // this.navMesh.debugDrawPath(this.path, 0xffd900);
    }
    this.repathCountdown = REPATH_FRAMES;
  } else {
    this.repathCountdown -= 1;
  }
};

Slime.prototype.takeDamage = function(dmg) {
  Actor.prototype.takeDamage.call(this, dmg);
  this.flashForSeconds(0.5);
};
Slime.prototype.flash = function(isFlashing) {
  this.alpha = isFlashing ? 0.3 : 1.0;
};
Slime.prototype.moveTowards = function(target) {
  var angle = this.position.angle(target);
  this.body.velocity.x = this.speed * Math.cos(angle);
  this.body.velocity.y = this.speed * Math.sin(angle);
};

var SlimeAnimUtil = {
  initSpriteWithAnims: function(slime) {
    slime.anchor.setTo(0.5, 0.5);

    slime.animations.add('idle_left', [0], 1, true);
    slime.animations.add('crouch_left', [0, 1, 2], 4, false);
    slime.animations.add('jump_left', [3], 1, true);
    slime.animations.add('land_left', [3, 4], 4, false);
    slime.animations.add('idle_right', [5], 1, true);
    slime.animations.add('crouch_right', [5, 6, 7], 4, false);
    slime.animations.add('jump_right', [8], 1, true);
    slime.animations.add('land_right', [8, 9], 4, false);
    slime.animations.play('idle_left');
  },
};

var SlimeBodyUtil = {
  initSpriteWithBody: function(game, sprite) {
    game.physics.arcade.enable(sprite);
    sprite.body.setSize(16, 16, 5, 12);
    sprite.body.tilePadding.set(8, 8);
    sprite.body.immovable = true;
  },
};
