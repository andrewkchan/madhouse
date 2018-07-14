// Factory for player state objects.
// ===============================
// a player state object contains functions enter, handleInput, and update.
// enter - called when the state is entered.
// handleInput - called when the state handles player input.
// update - called so the state can update the player object.
// ================================
// player state objects also contain public members:
// name - string name of the state.
var PlayerStateFactory = {
  IDLE: function() {
    var idleAnimation = "idle_down";
    var isRunning = false;
    var cursorAngle = 0.0;
    var isFiring = false;
    return {
      name: "IDLE",
      enter: function(player) {
        if (player.body.velocity.x > 0) {
          idleAnimation = "idle_right";
        } else if (player.body.velocity.x < 0) {
          idleAnimation = "idle_left";
        }

        if (player.body.velocity.y > 0) {
          idleAnimation = "idle_down";
        } else if (player.body.velocity.y < 0) {
          idleAnimation = "idle_up";
        }
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
      },
      handleInput: function(input) {
        cursorAngle = GameInputUtil.getCursorAngle(input);
        // take care of character movement --> enter run state
        isRunning = GameInputUtil.isMoving(input);
      },
      update: function(player, playerStateMachine) {
        if (isRunning) {
          playerStateMachine.popState();
          playerStateMachine.pushState(PlayerStateFactory.RUN());
        } else {
          idleAnimation = "idle_" + PlayerAnimUtil.getDirectionString(cursorAngle);
          PlayerAnimUtil.updateWeaponHand(player, cursorAngle);
          player._main.animations.play(idleAnimation);
        }
      },
      onFire: function(player, input) {
        player._weapon.fireAtPointer(input.activePointer);
      },
    };
  },
  RUN: function() {
    var velocityX = 0;
    var velocityY = 0;
    var speed = playState.player_speed;
    var isRolling = false;
    var cursorAngle = 0.0;
    return {
      name: "RUN",
      enter: function(player) {
        return;
      },
      handleInput: function(input) {
        var keyboard = input.keyboard;
        velocityX = 0;
        velocityY = 0;

        cursorAngle = GameInputUtil.getCursorAngle(input);

        // take care of character movement
        if ( keyboard.isDown(Phaser.KeyCode.W) ) {
          velocityY = -speed;
        } else if ( keyboard.isDown(Phaser.KeyCode.S) ) {
          velocityY = speed;
        }

        if ( keyboard.isDown(Phaser.KeyCode.A) ) {
          velocityX = -speed;
        } else if ( keyboard.isDown(Phaser.KeyCode.D) ) {
          velocityX = speed;
        }

        if (keyboard.isDown(Phaser.KeyCode.SPACEBAR)) {
          isRolling = true;
        }
      },
      update: function(player, playerStateMachine) {
        if (velocityX === 0 && velocityY === 0) {
          playerStateMachine.popState();
          playerStateMachine.pushState(PlayerStateFactory.IDLE());
          return;
        } else if (isRolling) {
          playerStateMachine.popState();
          playerStateMachine.pushState(PlayerStateFactory.ROLL(velocityX, velocityY));
          return;
        }
        // reduce speed if moving diagonally so that we don't move super quickly
        if ( velocityX && velocityY ) {
          player.body.velocity.x = velocityX * 0.66;
          player.body.velocity.y = velocityY * 0.66;
        } else {
          player.body.velocity.x = velocityX;
          player.body.velocity.y = velocityY;
        }

        var moveAnimation = PlayerAnimUtil.getDirectionString(cursorAngle);
        PlayerAnimUtil.updateWeaponHand(player, cursorAngle);
        player._main.animations.play(moveAnimation);
      },
      onFire: function(player, input) {
        player._weapon.fireAtPointer(input.activePointer);
      },
    };
  },
  ROLL: function(moveX, moveY) {
    var speed = 140;
    if (moveX && moveY) {
      speed *= 0.66;
    }
    var velocityX = Math.sign(moveX) * speed;
    var velocityY = Math.sign(moveY) * speed;
    var rollAnimation = null;
    return {
      name: "ROLL",
      isComplete: false,
      enter: function(player) {
        player.body.velocity.x = velocityX;
        player.body.velocity.y = velocityY;
        var animName = "roll_right";
        if (velocityY > 0) {
          animName = "roll_down";
        } else if (velocityY < 0) {
          animName = "roll_up";
        }

        if (velocityX > 0) {
          animName = "roll_right";
        } else if (velocityX < 0) {
          animName = "roll_left";
        }
        rollAnimation = player._main.animations.play(animName);
        player._main.animations.currentAnim.onComplete.addOnce(this.onComplete, this);
        PlayerAnimUtil.updateWeaponHand(player, 0, false);
      },
      handleInput: function(input) {
        return;
      },
      update: function(player, playerStateMachine) {
        if (this.isComplete) {
          playerStateMachine.popState();
          playerStateMachine.pushState(PlayerStateFactory.RECOVER(velocityX, velocityY));
          return;
        }
      },
      onFire: function(player, input) {
        return;
      },
      onComplete: function() {
        this.isComplete = true;
      },
    };
  },
  RECOVER: function(moveX, moveY) {
    var speed = 50;
    if (moveX && moveY) {
      speed *= 0.66;
    }
    var velocityX = Math.sign(moveX) * speed;
    var velocityY = Math.sign(moveY) * speed;
    var recoverAnimation = null;
    return {
      name: "RECOVER",
      isComplete: false,
      enter: function(player) {
        player.body.velocity.x = velocityX;
        player.body.velocity.y = velocityY;
        var animName = "recover_right";
        if (velocityY > 0) {
          animName = "recover_down";
        } else if (velocityY < 0) {
          animName = "recover_up";
        }

        if (velocityX > 0) {
          animName = "recover_right";
        } else if (velocityX < 0) {
          animName = "recover_left";
        }
        recoverAnimation = player._main.animations.play(animName);
        player._main.animations.currentAnim.onComplete.addOnce(this.onComplete, this);
        PlayerAnimUtil.updateWeaponHand(player, 0, false);
      },
      handleInput: function(input) {
        return;
      },
      update: function(player, playerStateMachine) {
        if (this.isComplete) {
          playerStateMachine.popState();
          playerStateMachine.pushState(PlayerStateFactory.IDLE());
          return;
        }
      },
      onFire: function(player, input) {
        return;
      },
      onComplete: function() {
        this.isComplete = true;
      },
    };
  },
  FALL: function(onComplete, onCompleteContext) {
    return {
      name: "FALL",
      enter: function(player) {
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        player._main.animations.play("fall");
        player._main.animations.currentAnim.onComplete.addOnce(onComplete, onCompleteContext);
        PlayerAnimUtil.updateWeaponHand(player, 0, false);
        return;
      },
      handleInput: function(input) {
        return;
      },
      update: function(player, playerStateMachine) {
        return;
      },
      onFire: function(player, input) {
        return;
      },
    };
  }
};

var PlayerAnimUtil = {
  createSpriteWithAnims: function(game) {
    // setup player
    var player = game.add.sprite(0, 0, 'empty_convict'); // invisible sprite as group root
    player.anchor.setTo( 0.5, 0.5 );

    // player weapon hands and weapon
    player._weaponHandR = player.addChild(game.make.sprite(4, 8, 'empty_convict_hand'));
    player._weaponHandR.anchor.setTo(0.5, 0.5);
    player._weaponHandR.pivot.x = -4;
    player._weaponHandR._gun = player._weaponHandR.addChild(game.make.sprite(0, 0, 'revolver'));
    player._weaponHandR._gun.anchor.set(0.15, 0.8);
    player._weaponHandR._hand = player._weaponHandR.addChild(game.make.sprite(0, 0, 'convict_hand'));
    player._weaponHandR._hand.anchor.setTo(0.5, 0.5);

    player._weaponHandL = player.addChild(game.make.sprite(-3, 8, 'empty_convict_hand'));
    player._weaponHandL.anchor.setTo(0.5, 0.5);
    player._weaponHandL.pivot.x = -3;
    player._weaponHandL._gun = player._weaponHandL.addChild(game.make.sprite(0, 0, 'revolver_flipped'));
    player._weaponHandL._gun.anchor.set(0.15, 0.2);
    player._weaponHandL._hand = player._weaponHandL.addChild(game.make.sprite(0, 0, 'convict_hand'));
    player._weaponHandL._hand.anchor.setTo(0.5, 0.5);
    player._weaponHandL.visible = false;

    player._weaponHandU = player.addChild(game.make.sprite(-6, 8, 'empty_convict_hand'));
    player._weaponHandU.anchor.setTo(0.5, 0.5);
    player._weaponHandU._gun = player._weaponHandU.addChild(game.make.sprite(0, 0, 'revolver'));
    player._weaponHandU._gun.anchor.set(0.15, 0.8);
    player._weaponHandU._hand = player._weaponHandU.addChild(game.make.sprite(0, 0, 'convict_hand'));
    player._weaponHandU._hand.anchor.setTo(0.5, 0.5);

    player._weaponHandD = player.addChild(game.make.sprite(6, 8, 'empty_convict_hand'));
    player._weaponHandD.anchor.setTo(0.5, 0.5);
    player._weaponHandD._gun = player._weaponHandD.addChild(game.make.sprite(0, 0, 'revolver'));
    player._weaponHandD._gun.anchor.set(0.15, 0.8);
    player._weaponHandD._hand = player._weaponHandD.addChild(game.make.sprite(0, 0, 'convict_hand'));
    player._weaponHandD._hand.anchor.setTo(0.5, 0.5);

    // player visible sprite
    player._main = player.addChild(game.make.sprite(0, 0, 'convict'));
    player._main.anchor.setTo( 0.5, 0.5 );

    // player animations
    player._main.animations.add('down', [18, 19, 20, 21, 22], 12, true);
    player._main.animations.add('up', [23, 24, 25, 26, 27, 28], 12, true);
    player._main.animations.add('right', [4, 5, 6, 7, 8], 12, true);
    player._main.animations.add('left', [72, 73, 74, 75, 76], 12, true);
    player._main.animations.add('roll_down', [58, 59, 60, 61], 10, false);
    player._main.animations.add('roll_up', [49, 50, 51, 52], 10, false);
    player._main.animations.add('roll_right', [9, 10, 11, 12], 10, false);
    player._main.animations.add('roll_left', [77, 78, 79, 80], 10, false);
    player._main.animations.add('recover_down', [62, 63, 64], 12, false);
    player._main.animations.add('recover_up', [53, 54, 55], 12, false);
    player._main.animations.add('recover_right', [13, 14, 15], 12, false);
    player._main.animations.add('recover_left', [81, 82, 83], 12, false);
    player._main.animations.add('idle_right', [0, 1, 2], 4, true);
    player._main.animations.add('idle_left', [68, 69, 70], 4, true);
    player._main.animations.add('idle_down', [46, 47, 48], 4, true);
    player._main.animations.add('idle_up', [29, 30, 31], 4, true);
    player._main.animations.add('fall', [86, 87, 88, 89], 10, false);

    return player;
  },
  getDirectionString: function(angle) {
    if (MathUtil.isDown(angle)) {
      return "down";
    } else if (MathUtil.isRight(angle)) {
      return "right";
    } else if (MathUtil.isUp(angle)) {
      return "up";
    } else {
      return "left";
    }
  },
  updateWeaponHand: function(player, angle, isVisible = true) {
    player._weaponHandL.visible = false;
    player._weaponHandR.visible = false;
    player._weaponHandU.visible = false;
    player._weaponHandD.visible = false;
    if (isVisible) {
      if (MathUtil.isDown(angle)) {
        player._weaponHandD.rotation = angle;
        player._weaponHandD.visible = true;
        player._weapon.trackSprite(player._weaponHandD._gun, 12, -8, true);
      } else if (MathUtil.isRight(angle)) {
        player._weaponHandR.rotation = angle;
        player._weaponHandR.visible = true;
        player._weapon.trackSprite(player._weaponHandR._gun, 12, -8, true);
      } else if (MathUtil.isUp(angle)) {
        player._weaponHandU.rotation = angle;
        player._weaponHandU.visible = true;
        player._weapon.trackSprite(player._weaponHandU._gun, 12, -8, true);
      } else {
        player._weaponHandL.rotation = angle;
        player._weaponHandL.visible = true;
        player._weapon.trackSprite(player._weaponHandR._gun, -12, -8, true);
      }
    }
  },
};

var PlayerBodyUtil = {
  initSpriteWithBody: function(game, sprite) {
    game.physics.arcade.enable(sprite);
    sprite.body.setSize( 8, 12, 9, 19 );
    sprite.body.tilePadding.set( 12, 12 );
  },
};
