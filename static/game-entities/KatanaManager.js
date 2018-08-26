// frames that the swing animation is visible
SWING_TIME = 0.2; // time in seconds for a swing to finish

function KatanaManager(player) {
  WeaponManager.call(this, player, "Katana");

  this.swingTime = 0; // set this to SWING_TIME to begin the swing animation
}

KatanaManager.prototype = Object.create(WeaponManager.prototype);
KatanaManager.prototype.constructor = KatanaManager;
KatanaManager.prototype.destroy = function() {
  this.player._weapon.destroy();
  this.player._weaponHandU.destroy();
  this.player._weaponHandD.destroy();
  this.player._weaponHandL.destroy();
  this.player._weaponHandR.destroy();
};
KatanaManager.prototype.initForegroundAnims = function() {
  var player = this.player;
  // swoosh thingies
  player._swingR0 = player.addChild(game.make.sprite(7, 8, 'katana_swing_r0'));
  player._swingR0.anchor.setTo(0.5, 0.7);
  player._swingR0._overlay = player._swingR0.addChild(game.make.sprite(0, 0, 'katana_swing_r0o'));
  player._swingR0._overlay.anchor.setTo(0.5, 0.7);
  player._swingR0._overlay.blendMode = PIXI.blendModes.OVERLAY;
  player._swingR0.visible = false;

  player._swingR1 = player.addChild(game.make.sprite(7, 12, 'katana_swing_r1'));
  player._swingR1.anchor.setTo(0.8, 1);
  player._swingR1._overlay = player._swingR1.addChild(game.make.sprite(0, 0, 'katana_swing_r1o'));
  player._swingR1._overlay.anchor.setTo(0.75, 0.85);
  player._swingR1._overlay.blendMode = PIXI.blendModes.OVERLAY;
  player._swingR1.visible = false;
};
KatanaManager.prototype.initBackgroundAnims = function() {
  var player = this.player;

  player._wave = player.addChild(game.make.sprite(3, 10, 'katana_wave'));
  player._wave.anchor.setTo(0, 1);
  player._wave.animations.add('wave', [0, 1], 10);
  player._wave.visible = false;

  // player weapon hands and weapon

  function makeHand(offsetX, offsetY, flipped=false) {
    var hand = player.addChild(game.make.sprite(offsetX, offsetY, 'empty_convict_hand'));
    hand.anchor.setTo(0.5, 0.5);
    hand.pivot.x = -1;
    hand.pivot.y = 1;
    var gunSprite = flipped ? 'katana_flipped' : 'katana';
    hand._gun = hand.addChild(game.make.sprite(0, 0, gunSprite));
    var anchorY = flipped ? 0.13 : 0.87;
    hand._gun.anchor.set(0.5, anchorY);

    var gunSprite2 = flipped ? 'katana_swoosh_flipped' : 'katana_swoosh';
    hand._gun2 = hand.addChild(game.make.sprite(0, 0, gunSprite2));
    hand._gun2.anchor.set(0.5, anchorY);
    hand._gun2.visible = false;

    hand._hand = hand.addChild(game.make.sprite(0, 0, 'convict_hand'));
    hand._hand.anchor.setTo(0.5, 0.5);
    if (flipped) {
      hand._attackTween =
        game.add.tween(hand).to({ rotation: '+3.1415926' }, 20, Phaser.Easing.Linear.None);
      hand._attackTween.chain(
        game.add.tween(hand).to({ rotation: '-3.1415926' }, 150, Phaser.Easing.Quadratic.In)
      );
    } else {
      hand._attackTween =
        game.add.tween(hand).to({ rotation: '+3.1415926' }, 20, Phaser.Easing.Linear.None);
      hand._attackTween.chain(
        game.add.tween(hand).to({ rotation: '-3.1415926' }, 150, Phaser.Easing.Quadratic.In)
      );
    }
    return hand;
  }
  player._weaponHandR = makeHand(7, 8);
  player._weaponHandL = makeHand(-6, 8, true);
  player._weaponHandU = makeHand(-6, 8);
  player._weaponHandD = makeHand(6, 8);

  this.player._weapon.trackSprite(player._weaponHandR, 12, -8, true);
};
KatanaManager.prototype.update = function(angle, isVisible = true) {
  var player = this.player;
  player._weaponHandL.visible = false;
  player._weaponHandR.visible = false;
  player._weaponHandU.visible = false;
  player._weaponHandD.visible = false;
  player._swingR0.visible = false;
  player._swingR1.visible = false;
  player._wave.visible = false;
  if (isVisible) {
    var visibleHand = null;
    if (MathUtil.isDown(angle)) {
      visibleHand = player._weaponHandD;
    } else if (MathUtil.isRight(angle)) {
      visibleHand = player._weaponHandR;
    } else if (MathUtil.isUp(angle)) {
      visibleHand = player._weaponHandU;
    } else {
      visibleHand = player._weaponHandL;
    }

    visibleHand.visible = true;
    visibleHand._gun.visible = false;
    visibleHand._gun2.visible = false;
    if (this.swingTime > 0) {
      visibleHand._gun2.visible = true;
      player._wave.visible = true;
      this.swingTime -= game.time.physicsElapsed;
    } else {
      visibleHand._gun.visible = true;
    }
    visibleHand.rotation = angle;
  }
};
KatanaManager.prototype.fire = function(input) {
  // NOTE: The super class WeaponManager by default would call ::onFire(_weapon) here, which sends a message
  // to the server. However, since we don't call the superclass's method, we will send a message to the server
  // right here instead.

  // can the player fire?
  if (this.swingTime <= 0) {
    // play the animation
    var angle = GameInputUtil.getCursorAngle(input);
    this.playFireAnim(angle);

    // send `localKatanaAttack` event to server with assoc. angle
    Client.socket.emit("localKatanaAttack", {
      angle: angle,
    });
  }
};
KatanaManager.prototype.playFireAnim = function(angle) {
  var player = this.player;

  var visibleHand = null;
  if (MathUtil.isDown(angle)) {
    visibleHand = player._weaponHandD;
  } else if (MathUtil.isRight(angle)) {
    visibleHand = player._weaponHandR;
  } else if (MathUtil.isUp(angle)) {
    visibleHand = player._weaponHandU;
  } else {
    visibleHand = player._weaponHandL;
  }
  visibleHand._attackTween.start();
  this.swingTime = SWING_TIME;
  player._wave.rotation = angle + Math.PI/4;
  player._wave.animations.play('wave');
};
