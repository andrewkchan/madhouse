function Slime() {
  Actor.call(this, 'slime', 0, 0, 'slime');
  SlimeAnimUtil.initSpriteWithAnims(this);
  SlimeBodyUtil.initSpriteWithBody(game, this);

}
Slime.prototype = Object.create(Actor.prototype);
Slime.prototype.constructor = Slime;

Slime.prototype.update = function(game) {
  return;
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
    sprite.body.setSize(20, 18, 3, 12);
    sprite.body.tilePadding.set(8, 8);
    sprite.body.immovable = true;
  },
};
