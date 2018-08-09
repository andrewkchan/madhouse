function DualUziManager(player) {
  WeaponManager.call(this, player);

  // the weapon gameobject
  this.player._weapon.bulletClass = RevolverBullet;
  this.player._weapon.createBullets(-1);
  this.player._weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
  this.player._weapon.bulletSpeed = 250;
  this.player._weapon.fireRate = 120; // ms between each shot in autofire mode
  this.player._weapon.bulletAngleVariance = 10; // degrees of shot spread

  this.dualWieldToggle = true;
  this.player._weapon.onFire.add(function(weapon, bullet) {
    this.dualWieldToggle = !this.dualWieldToggle;
  }, this);
}

DualUziManager.prototype = Object.create(WeaponManager);
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
DualUziManager.prototype.initForegroundAnims = function() {
  var player = this.player;
  // player weapon hands and weapon
  player._weaponHandR = player.addChild(game.make.sprite(7, 9, 'empty_convict_hand'));
  player._weaponHandR.anchor.setTo(0.5, 0.5);
  player._weaponHandR._recoilTween =
    game.add.tween(player._weaponHandR).to({ x: 4 }, 20, Phaser.Easing.Linear.None);
  player._weaponHandR._recoilTween.chain(
    game.add.tween(player._weaponHandR).to({ x: 7 }, 50, Phaser.Easing.Linear.None)
  );
  player._weaponHandR._gun = player._weaponHandR.addChild(game.make.sprite(0, 0, 'uzi'));
  player._weaponHandR._gun.anchor.set(0.35, 0.45);
  player._weaponHandR._hand = player._weaponHandR.addChild(game.make.sprite(0, 0, 'convict_hand'));
  player._weaponHandR._hand.anchor.setTo(0.5, 0.5);

  player._weaponHandR2 = player.addChild(game.make.sprite(-2, 9, 'empty_convict_hand'));
  player._weaponHandR2.anchor.setTo(0.5, 0.5);
  player._weaponHandR2._recoilTween =
    game.add.tween(player._weaponHandR2).to({ x: -5 }, 20, Phaser.Easing.Linear.None);
  player._weaponHandR2._recoilTween.chain(
    game.add.tween(player._weaponHandR2).to({ x: -2 }, 50, Phaser.Easing.Linear.None)
  );
  player._weaponHandR2._gun = player._weaponHandR2.addChild(game.make.sprite(0, 0, 'uzi'));
  player._weaponHandR2._gun.anchor.set(0.35, 0.45);
  player._weaponHandR2._hand = player._weaponHandR2.addChild(game.make.sprite(0, 0, 'convict_hand'));
  player._weaponHandR2._hand.anchor.setTo(0.5, 0.5);

  player._weaponHandL = player.addChild(game.make.sprite(-6, 9, 'empty_convict_hand'));
  player._weaponHandL.anchor.setTo(0.5, 0.5);
  player._weaponHandL._recoilTween =
    game.add.tween(player._weaponHandL).to({ x: -3 }, 20, Phaser.Easing.Linear.None);
  player._weaponHandL._recoilTween.chain(
    game.add.tween(player._weaponHandL).to({ x: -6 }, 50, Phaser.Easing.Linear.None)
  );
  player._weaponHandL._gun = player._weaponHandL.addChild(game.make.sprite(0, 0, 'uzi_flipped'));
  player._weaponHandL._gun.anchor.set(0.35, 0.55);
  player._weaponHandL._hand = player._weaponHandL.addChild(game.make.sprite(0, 0, 'convict_hand'));
  player._weaponHandL._hand.anchor.setTo(0.5, 0.5);
  player._weaponHandL.visible = false;

  player._weaponHandL2 = player.addChild(game.make.sprite(2, 9, 'empty_convict_hand'));
  player._weaponHandL2.anchor.setTo(0.5, 0.5);
  player._weaponHandL2._recoilTween =
    game.add.tween(player._weaponHandL2).to({ x: 5 }, 20, Phaser.Easing.Linear.None);
  player._weaponHandL2._recoilTween.chain(
    game.add.tween(player._weaponHandL2).to({ x: 2 }, 50, Phaser.Easing.Linear.None)
  );
  player._weaponHandL2._gun = player._weaponHandL2.addChild(game.make.sprite(0, 0, 'uzi_flipped'));
  player._weaponHandL2._gun.anchor.set(0.35, 0.55);
  player._weaponHandL2._hand = player._weaponHandL2.addChild(game.make.sprite(0, 0, 'convict_hand'));
  player._weaponHandL2._hand.anchor.setTo(0.5, 0.5);
  player._weaponHandL2.visible = false;

  player._weaponHandD = player.addChild(game.make.sprite(6, 9, 'empty_convict_hand'));
  player._weaponHandD.anchor.setTo(0.5, 0.5);
  player._weaponHandD._recoilTween =
    game.add.tween(player._weaponHandD).to({ y: 5 }, 20, Phaser.Easing.Linear.None);
  player._weaponHandD._recoilTween.chain(
    game.add.tween(player._weaponHandD).to({ y: 9 }, 50, Phaser.Easing.Linear.None)
  );
  player._weaponHandD._gun = player._weaponHandD.addChild(game.make.sprite(0, 0, 'uzi'));
  player._weaponHandD._gun.anchor.set(0.35, 0.45);
  player._weaponHandD._hand = player._weaponHandD.addChild(game.make.sprite(0, 0, 'convict_hand'));
  player._weaponHandD._hand.anchor.setTo(0.5, 0.5);

  player._weaponHandD2 = player.addChild(game.make.sprite(-2, 9, 'empty_convict_hand'));
  player._weaponHandD2.anchor.setTo(0.5, 0.5);
  player._weaponHandD2._recoilTween =
    game.add.tween(player._weaponHandD2).to({ y: 5 }, 20, Phaser.Easing.Linear.None);
  player._weaponHandD._recoilTween.chain(
    game.add.tween(player._weaponHandD2).to({ y: 9 }, 50, Phaser.Easing.Linear.None)
  );
  player._weaponHandD2._gun = player._weaponHandD2.addChild(game.make.sprite(0, 0, 'uzi'));
  player._weaponHandD2._gun.anchor.set(0.35, 0.45);
  player._weaponHandD2._hand = player._weaponHandD2.addChild(game.make.sprite(0, 0, 'convict_hand'));
  player._weaponHandD2._hand.anchor.setTo(0.5, 0.5);

  this.player._weapon.trackSprite(player._weaponHandR, 7, -3, true);
};
DualUziManager.prototype.initBackgroundAnims = function() {
  var player = this.player;

  player._weaponHandU = player.addChild(game.make.sprite(-6, 8, 'empty_convict_hand'));
  player._weaponHandU.anchor.setTo(0.5, 0.5);
  player._weaponHandU._recoilTween =
    game.add.tween(player._weaponHandU).to({ y: 11 }, 20, Phaser.Easing.Linear.None);
  player._weaponHandU._recoilTween.chain(
    game.add.tween(player._weaponHandU).to({ y: 8 }, 50, Phaser.Easing.Linear.None)
  );
  player._weaponHandU._gun = player._weaponHandU.addChild(game.make.sprite(0, 0, 'uzi'));
  player._weaponHandU._gun.anchor.set(0.35, 0.45);
  player._weaponHandU._hand = player._weaponHandU.addChild(game.make.sprite(0, 0, 'convict_hand'));
  player._weaponHandU._hand.anchor.setTo(0.5, 0.5);

  player._weaponHandU2 = player.addChild(game.make.sprite(1, 8, 'empty_convict_hand'));
  player._weaponHandU2.anchor.setTo(0.5, 0.5);
  player._weaponHandU2._recoilTween =
    game.add.tween(player._weaponHandU).to({ y: 11 }, 20, Phaser.Easing.Linear.None);
  player._weaponHandU2._recoilTween.chain(
    game.add.tween(player._weaponHandU).to({ y: 8 }, 50, Phaser.Easing.Linear.None)
  );
  player._weaponHandU2._gun = player._weaponHandU2.addChild(game.make.sprite(0, 0, 'uzi'));
  player._weaponHandU2._gun.anchor.set(0.35, 0.45);
  player._weaponHandU2._hand = player._weaponHandU2.addChild(game.make.sprite(0, 0, 'convict_hand'));
  player._weaponHandU2._hand.anchor.setTo(0.5, 0.5);
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
      } else {
        player._weapon.trackSprite(player._weaponHandD2, 10, -3, true);
      }
    } else if (MathUtil.isRight(angle)) {
      player._weaponHandR.rotation = angle;
      player._weaponHandR.visible = true;
      player._weaponHandR2.rotation = angle;
      player._weaponHandR2.visible = true;
      if (this.dualWieldToggle) {
        player._weapon.trackSprite(player._weaponHandR, 10, -3, true);
      } else {
        player._weapon.trackSprite(player._weaponHandR2, 10, -3, true);
      }
    } else if (MathUtil.isUp(angle)) {
      player._weaponHandU.rotation = angle;
      player._weaponHandU.visible = true;
      player._weaponHandU2.rotation = angle;
      player._weaponHandU2.visible = true;
      if (this.dualWieldToggle) {
        player._weapon.trackSprite(player._weaponHandU, 15, -3, true);
      } else {
        player._weapon.trackSprite(player._weaponHandU2, 15, -3, true);
      }
    } else {
      player._weaponHandL.rotation = angle;
      player._weaponHandL.visible = true;
      player._weaponHandL2.rotation = angle;
      player._weaponHandL2.visible = true;
      if (this.dualWieldToggle) {
        player._weapon.trackSprite(player._weaponHandL, 10, 3, true);
      } else {
        player._weapon.trackSprite(player._weaponHandL2, 10, 3, true);
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
