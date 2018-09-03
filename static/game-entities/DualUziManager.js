function DualUziManager(player) {
  WeaponManager.call(this, player, "DualUzi");

  // the weapon gameobject
  this.player._weapon.bulletClass = RevolverBullet;
  this.player._weapon.createBullets(-1);
  this.player._weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
  this.player._weapon.bulletSpeed = 250;
  this.player._weapon.fireRate = 120; // ms between each shot in autofire mode
  this.player._weapon.bulletAngleVariance = 10; // degrees of shot spread

  this.dualWieldToggle = true;
  this.activeFlash = null;
}

DualUziManager.prototype = Object.create(WeaponManager.prototype);
DualUziManager.prototype.constructor = DualUziManager;
DualUziManager.prototype.destroy = function() {
  this.player._weapon.destroy();
  this.player._weaponHandU.destroy();
  this.player._weaponHandD.destroy();
  this.player._weaponHandL.destroy();
  this.player._weaponHandR.destroy();
  this.player._weaponHandU2.destroy();
  this.player._weaponHandD2.destroy();
  this.player._weaponHandL2.destroy();
  this.player._weaponHandR2.destroy();
};
DualUziManager.prototype.makeHand = function(offsetX, offsetY, direction, flipped=false) {
  var player = this.player;
  // direction string is 'L', 'R', 'U', or 'D'.
  var hand = player.addChild(game.make.sprite(offsetX, offsetY, 'empty_convict_hand'));
  hand.anchor.setTo(0.5, 0.5);
  hand.pivot.x = -1;
  hand.pivot.y = 1;
  var gunSprite = flipped ? 'uzi_flipped' : 'uzi';
  hand._gun = hand.addChild(game.make.sprite(0, 0, gunSprite));
  var anchorY = flipped ? 0.55 : 0.45;
  hand._gun.anchor.set(0.35, anchorY);
  var flashOffsetY = flipped ? 0 : -anchorY*11;
  hand._gun._flash = hand._gun.addChild(game.make.sprite(10, flashOffsetY, 'muzzle_flash_sm'));
  hand._gun._flash.blendMode = PIXI.blendModes.SCREEN;
  hand._gun._flash.kill();

  hand._hand = hand.addChild(game.make.sprite(0, 0, 'convict_hand'));
  hand._hand.anchor.setTo(0.5, 0.5);

  var tweenStart = null;
  var tweenEnd = null;
  switch (direction) {
    case 'L': {
      tweenStart = { x: '+3' };
      tweenEnd = { x: '-3' };
      break;
    }
    case 'R': {
      tweenStart = { x: '-3' };
      tweenEnd = { x: '+3' };
      break;
    }
    case 'U': {
      tweenStart = { y: '+4' };
      tweenEnd = { y: '-4' };
    }
    case 'D': {
      tweenStart = { y: '-4' };
      tweenEnd = { y: '+4' };
    }
  }
  hand._recoilTween =
    game.add.tween(hand).to(tweenStart, 20, Phaser.Easing.Linear.None);
  hand._recoilTween.chain(
    game.add.tween(hand).to(tweenEnd, 50, Phaser.Easing.Linear.None)
  );
  return hand;
};
DualUziManager.prototype.initForegroundAnims = function() {
  var player = this.player;
  // player weapon hands and weapon
  player._weaponHandR = this.makeHand(8, 9, 'R');
  player._weaponHandR2 = this.makeHand(-1, 9, 'R');

  player._weaponHandL = this.makeHand(-6, 9, 'L', true);
  player._weaponHandL2 = this.makeHand(2, 9, 'L', true);

  player._weaponHandD = this.makeHand(6, 9, 'D');
  player._weaponHandD2 = this.makeHand(-2, 9, 'D');

  this.player._weapon.trackSprite(player._weaponHandR, 7, -3, true);
  this.activeFlash = this.player._weaponHandR._gun._flash;
};
DualUziManager.prototype.initBackgroundAnims = function() {
  var player = this.player;

  player._weaponHandU = this.makeHand(-6, 7, 'U');
  player._weaponHandU2 = this.makeHand(1, 7, 'U');
};
DualUziManager.prototype.recoilWeaponHand = function(angle) {
  if (MathUtil.isDown(angle)) {
    this.player._weaponHandD._recoilTween.start();
    this.player._weaponHandD2._recoilTween.start();
  } else if (MathUtil.isRight(angle)) {
    this.player._weaponHandR._recoilTween.start();
    this.player._weaponHandR2._recoilTween.start();
  } else if (MathUtil.isUp(angle)) {
    this.player._weaponHandU._recoilTween.start();
    this.player._weaponHandU2._recoilTween.start();
  } else {
    this.player._weaponHandL._recoilTween.start();
    this.player._weaponHandL2._recoilTween.start();
  }
};
DualUziManager.prototype.update = function(angle, isVisible = true) {
  var player = this.player;
  player._weaponHandL.visible = false;
  player._weaponHandR.visible = false;
  player._weaponHandU.visible = false;
  player._weaponHandD.visible = false;
  player._weaponHandL2.visible = false;
  player._weaponHandR2.visible = false;
  player._weaponHandU2.visible = false;
  player._weaponHandD2.visible = false;
  if (isVisible) {
    if (MathUtil.isDown(angle)) {
      player._weaponHandD.rotation = angle;
      player._weaponHandD2.rotation = angle;
      player._weaponHandD.visible = true;
      player._weaponHandD2.visible = true;
      if (this.dualWieldToggle) {
        player._weapon.trackSprite(player._weaponHandD, 10, -3, true);
        this.activeFlash = player._weaponHandD._gun._flash;
      } else {
        player._weapon.trackSprite(player._weaponHandD2, 10, -3, true);
        this.activeFlash = player._weaponHandD2._gun._flash;
      }
    } else if (MathUtil.isRight(angle)) {
      player._weaponHandR.rotation = angle;
      player._weaponHandR.visible = true;
      player._weaponHandR2.rotation = angle;
      player._weaponHandR2.visible = true;
      if (this.dualWieldToggle) {
        player._weapon.trackSprite(player._weaponHandR, 10, -3, true);
        this.activeFlash = player._weaponHandR._gun._flash;
      } else {
        player._weapon.trackSprite(player._weaponHandR2, 10, -3, true);
        this.activeFlash = player._weaponHandR2._gun._flash;
      }
    } else if (MathUtil.isUp(angle)) {
      player._weaponHandU.rotation = angle;
      player._weaponHandU.visible = true;
      player._weaponHandU2.rotation = angle;
      player._weaponHandU2.visible = true;
      if (this.dualWieldToggle) {
        player._weapon.trackSprite(player._weaponHandU, 15, -3, true);
        this.activeFlash = player._weaponHandU._gun._flash;
      } else {
        player._weapon.trackSprite(player._weaponHandU2, 15, -3, true);
        this.activeFlash = player._weaponHandU2._gun._flash;
      }
    } else {
      player._weaponHandL.rotation = angle;
      player._weaponHandL.visible = true;
      player._weaponHandL2.rotation = angle;
      player._weaponHandL2.visible = true;
      if (this.dualWieldToggle) {
        player._weapon.trackSprite(player._weaponHandL, 10, 3, true);
        this.activeFlash = player._weaponHandL._gun._flash;
      } else {
        player._weapon.trackSprite(player._weaponHandL2, 10, 3, true);
        this.activeFlash = player._weaponHandL2._gun._flash;
      }
    }
    this.fireIfDown();
  }
};
DualUziManager.prototype.fireIfDown = function() {
  // tiny hack to fire with 1 weapon object from 2 guns
  if (this.player._weapon.autofire && game.input.activePointer.isDown) {
    this.player._weapon.fireAtPointer(game.input.activePointer);
    this.recoilWeaponHand(GameInputUtil.getCursorAngle(game.input));
  }
};
DualUziManager.prototype.fire = function(input) {
  this.player._weapon.autofire = true;
};
DualUziManager.prototype.fireStop = function(input) {
  this.player._weapon.autofire = false;
};
DualUziManager.prototype.onFire = function(weapon, bullet) {
  WeaponManager.prototype.onFire.call(this, weapon, bullet);
  this.activeFlash.revive();
  this.activeFlash.lifespan = 70;
  this.dualWieldToggle = !this.dualWieldToggle;
};
