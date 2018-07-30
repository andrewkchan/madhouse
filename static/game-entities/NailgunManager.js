function NailgunManager(player) {
  WeaponManager.call(this, player);

  // the weapon gameobject
  this.player._weapon.bulletClass = RevolverBullet;
  this.player._weapon.setBulletBodyOffset(6, 6, 0, 0);
  this.player._weapon.createBullets(-1);
  this.player._weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
  this.player._weapon.bulletSpeed = 300;
  this.player._weapon.fireRate = 5;

  // player weapon hands and weapon
  player._weaponHandR = player.addChild(game.make.sprite(7, 8, 'empty_convict_hand'));
  player._weaponHandR.anchor.setTo(0.5, 0.5);
  player._weaponHandR._recoilTween =
    game.add.tween(player._weaponHandR).to({ x: 4, rotation: '-0.5' }, 20, Phaser.Easing.Linear.None);
  player._weaponHandR._recoilTween.chain(
    game.add.tween(player._weaponHandR).to({ x: 7, rotation: '+0.5' }, 50, Phaser.Easing.Linear.None)
  );
  player._weaponHandR._gun = player._weaponHandR.addChild(game.make.sprite(0, 0, 'nailgun'));
  player._weaponHandR._gun.anchor.set(0.25, 0.45);
  player._weaponHandR._hand = player._weaponHandR.addChild(game.make.sprite(0, 0, 'convict_hand'));
  player._weaponHandR._hand.anchor.setTo(0.5, 0.5);

  player._weaponHandL = player.addChild(game.make.sprite(-6, 8, 'empty_convict_hand'));
  player._weaponHandL.anchor.setTo(0.5, 0.5);
  player._weaponHandL._recoilTween =
    game.add.tween(player._weaponHandL).to({ x: -3, rotation: '+0.5' }, 20, Phaser.Easing.Linear.None);
  player._weaponHandL._recoilTween.chain(
    game.add.tween(player._weaponHandL).to({ x: -6, rotation: '-0.5' }, 50, Phaser.Easing.Linear.None)
  );
  player._weaponHandL._gun = player._weaponHandL.addChild(game.make.sprite(0, 0, 'nailgun_flipped'));
  player._weaponHandL._gun.anchor.set(0.25, 0.55);
  player._weaponHandL._hand = player._weaponHandL.addChild(game.make.sprite(0, 0, 'convict_hand'));
  player._weaponHandL._hand.anchor.setTo(0.5, 0.5);
  player._weaponHandL.visible = false;

  player._weaponHandU = player.addChild(game.make.sprite(-6, 8, 'empty_convict_hand'));
  player._weaponHandU.anchor.setTo(0.5, 0.5);
  player._weaponHandU._recoilTween =
    game.add.tween(player._weaponHandU).to({ y: 11, rotation: '-0.5' }, 20, Phaser.Easing.Linear.None);
  player._weaponHandU._recoilTween.chain(
    game.add.tween(player._weaponHandU).to({ y: 8, rotation: '+0.5' }, 50, Phaser.Easing.Linear.None)
  );
  player._weaponHandU._gun = player._weaponHandU.addChild(game.make.sprite(0, 0, 'nailgun'));
  player._weaponHandU._gun.anchor.set(0.25, 0.45);
  player._weaponHandU._hand = player._weaponHandU.addChild(game.make.sprite(0, 0, 'convict_hand'));
  player._weaponHandU._hand.anchor.setTo(0.5, 0.5);

  player._weaponHandD = player.addChild(game.make.sprite(6, 8, 'empty_convict_hand'));
  player._weaponHandD.anchor.setTo(0.5, 0.5);
  player._weaponHandD._recoilTween =
    game.add.tween(player._weaponHandD).to({ y: 5, rotation: '-0.5' }, 20, Phaser.Easing.Linear.None);
  player._weaponHandD._recoilTween.chain(
    game.add.tween(player._weaponHandD).to({ y: 8, rotation: '+0.5' }, 50, Phaser.Easing.Linear.None)
  );
  player._weaponHandD._gun = player._weaponHandD.addChild(game.make.sprite(0, 0, 'nailgun'));
  player._weaponHandD._gun.anchor.set(0.25, 0.45);
  player._weaponHandD._hand = player._weaponHandD.addChild(game.make.sprite(0, 0, 'convict_hand'));
  player._weaponHandD._hand.anchor.setTo(0.5, 0.5);

  this.player._weapon.trackSprite(player._weaponHandR, 7, -3, true);
}

NailgunManager.prototype = Object.create(WeaponManager);
NailgunManager.prototype.constructor = NailgunManager;
NailgunManager.prototype.destroy = function() {
  this.player._weapon.destroy();
  this.player._weaponHandU.destroy();
  this.player._weaponHandD.destroy();
  this.player._weaponHandL.destroy();
  this.player._weaponHandR.destroy();
};
NailgunManager.prototype.recoilWeaponHand = function(angle) {
  if (MathUtil.isDown(angle)) {
    this.player._weaponHandD._recoilTween.start();
  } else if (MathUtil.isRight(angle)) {
    this.player._weaponHandR._recoilTween.start();
  } else if (MathUtil.isUp(angle)) {
    this.player._weaponHandU._recoilTween.start();
  } else {
    this.player._weaponHandL._recoilTween.start();
  }
};
NailgunManager.prototype.update = function(angle, isVisible = true) {
  var player = this.player;
  player._weaponHandL.visible = false;
  player._weaponHandR.visible = false;
  player._weaponHandU.visible = false;
  player._weaponHandD.visible = false;
  if (isVisible) {
    if (MathUtil.isDown(angle)) {
      player._weaponHandD.rotation = angle;
      player._weaponHandD.visible = true;
      player._weapon.trackSprite(player._weaponHandD, 7, -3, true);
    } else if (MathUtil.isRight(angle)) {
      player._weaponHandR.rotation = angle;
      player._weaponHandR.visible = true;
      player._weapon.trackSprite(player._weaponHandR, 7, -3, true);
    } else if (MathUtil.isUp(angle)) {
      player._weaponHandU.rotation = angle;
      player._weaponHandU.visible = true;
      player._weapon.trackSprite(player._weaponHandU, 7, -3, true);
    } else {
      player._weaponHandL.rotation = angle;
      player._weaponHandL.visible = true;
      player._weapon.trackSprite(player._weaponHandL, 7, 3, true);
    }
  }
};
NailgunManager.prototype.fire = function(input) {
  WeaponManager.prototype.fire.call(this, input);
};
