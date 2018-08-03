function Player(navMesh) {
  Actor.call(this, 'player', 0, 0, 'empty_convict');
  this.weaponManager = new NailgunManager(this);
  PlayerAnimUtil.initSpriteWithAnims(this);
  PlayerBodyUtil.initSpriteWithBody(game, this);

  this.health = 100;

  this.playerStateMachine = StateMachineUtil.createStateMachine(this);
  this.playerStateMachine.pushState(PlayerStateFactory.IDLE());
  game.input.onDown.add(function() {
    this.playerStateMachine.peekState().onFire(this, game.input);
  }, this);

}
Player.prototype = Object.create(Actor.prototype);
Player.prototype.constructor = Player;

Player.prototype.handleInput = function(input) {
  this.playerStateMachine.peekState().handleInput(input);
};
Player.prototype.update = function() {
  Actor.prototype.update.call(this);
  this.playerStateMachine.peekState().update(this, this.playerStateMachine);
};
Player.prototype.takeDamage = function(dmg) {
  Actor.prototype.takeDamage.call(this, dmg);
  this.flashForSeconds(0.5);
};
Player.prototype.flash = function(isFlashing) {
  this._main.alpha = isFlashing ? 0.3 : 1.0;
};
Player.prototype.getSnapshot = function() {
  // get a trimmed view of the player properties to send to the server.
  return {
    x: this.x,
    y: this.y,
    velocity: {
      x: this.body.velocity.x,
      y: this.body.velocity.y,
    },
  };
};

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
          player.weaponManager.update(cursorAngle);
          player._main.animations.play(idleAnimation);
        }
      },
      onFire: function(player, input) {
        player.weaponManager.fire(input);
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
        player.weaponManager.update(cursorAngle);
        player._main.animations.play(moveAnimation);
      },
      onFire: function(player, input) {
        player.weaponManager.fire(input);
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
        player.weaponManager.update(0, isVisible = false);
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
        player.weaponManager.update(0, isVisible = false);
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
        player.weaponManager.update(0, isVisible = false);
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
  initSpriteWithAnims: function(player) {
    player.anchor.setTo( 0.5, 0.5 );

    // player visible sprite
    player._main = player.addChild(game.make.sprite(0, 0, 'brian'));
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
};

var PlayerBodyUtil = {
  initSpriteWithBody: function(game, sprite) {
    game.physics.arcade.enable(sprite);
    sprite.body.setSize( 8, 12, 9, 19 );
    sprite.body.tilePadding.set( 12, 12 );
  },
};
