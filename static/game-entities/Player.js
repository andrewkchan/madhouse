function Player(navMesh) {
  Actor.call(this, 'player', 0, 0, 'empty_convict');
  this.weaponManager = new NailgunManager(this);
  PlayerAnimUtil.initSpriteWithAnims(this);
  PlayerBodyUtil.initSpriteWithBody(game, this);

  this.health = 100;

  this.playerStateMachine = StateMachineUtil.createStateMachine(this);
  this.playerStateMachine.pushState(PlayerStateFactory.IDLE());
}
Player.prototype = Object.create(Actor.prototype);
Player.prototype.constructor = Player;

Player.prototype.addInputEvents = function() {
  game.input.onDown.add(function() {
    this.playerStateMachine.peekState().onFire(this, game.input);
  }, this);
};
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
Player.prototype.peekState = function() {
  return this.playerStateMachine.peekState();
}
Player.prototype.getSnapshot = function() {
  // get a trimmed view of the player properties to send to the server.
  return {
    x: this.x,
    y: this.y,
    velocity: {
      x: this.body.velocity.x,
      y: this.body.velocity.y,
    },
    currentStateName: this.playerStateMachine.peekState().name,
  };
};
Player.prototype.syncWithSnapshot = function(playerSnapshot) {
  // sync player properties with a server player snapshot.
  this.x = playerSnapshot.x;
  this.y = playerSnapshot.y;
  this.body.velocity.x = playerSnapshot.velocity.x;
  this.body.velocity.y = playerSnapshot.velocity.y;
  if (this.playerStateMachine.peekState().name !== playerSnapshot.currentStateName) {
    // this.playerStateMachine.popState();
    // this.playerStateMachine.pushState(PlayerStateFactory[playerSnapshot.currentStateName]());
  }
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
  _idlePool: [],
  IDLE: function() {
    var state = null;
    if (this._idlePool.length > 0) {
      state = this._idlePool.pop();
    } else {
      // create new IDLE state
      state = {
        name: "IDLE",
        idleAnimation: "idle_down",
        isRunning: false,
        cursorAngle: 0.0,
        isFiring: false,
        enter: function(player) {
          if (player.body.velocity.x > 0) {
            this.idleAnimation = "idle_right";
          } else if (player.body.velocity.x < 0) {
            this.idleAnimation = "idle_left";
          }

          if (player.body.velocity.y > 0) {
            this.idleAnimation = "idle_down";
          } else if (player.body.velocity.y < 0) {
            this.idleAnimation = "idle_up";
          }
          player.body.velocity.x = 0;
          player.body.velocity.y = 0;
        },
        handleInput: function(input) {
          this.cursorAngle = GameInputUtil.getCursorAngle(input);
          // take care of character movement --> enter run state
          this.isRunning = GameInputUtil.isMoving(input);
        },
        update: function(player, playerStateMachine) {
          if (this.isRunning) {
            playerStateMachine.popState();
            playerStateMachine.pushState(PlayerStateFactory.RUN());
          } else {
            this.idleAnimation = "idle_" + PlayerAnimUtil.getDirectionString(this.cursorAngle);
            player.weaponManager.update(this.cursorAngle);
            player._main.animations.play(this.idleAnimation);
          }
        },
        onFire: function(player, input) {
          player.weaponManager.fire(input);
        },
        resolve: function() {
          this.isRunning = false;
          this.isFiring = false;
          this.cursorAngle = 0.0;
          PlayerStateFactory._idlePool.push(this);
        },
      };
    }
    return state;
  },
  _runPool: [],
  RUN: function() {
    var speed = playState.player_speed;
    var state = null;
    if (this._runPool.length > 0) {
      state = this._runPool.pop();
    } else {
      state = {
        name: "RUN",
        velocityX: 0,
        velocityY: 0,
        isRolling: false,
        cursorAngle: 0.0,
        enter: function(player) {
          return;
        },
        handleInput: function(input) {
          var keyboard = input.keyboard;
          this.velocityX = 0;
          this.velocityY = 0;

          this.cursorAngle = GameInputUtil.getCursorAngle(input);

          // take care of character movement
          if ( keyboard.isDown(Phaser.KeyCode.W) ) {
            this.velocityY = -speed;
          } else if ( keyboard.isDown(Phaser.KeyCode.S) ) {
            this.velocityY = speed;
          }

          if ( keyboard.isDown(Phaser.KeyCode.A) ) {
            this.velocityX = -speed;
          } else if ( keyboard.isDown(Phaser.KeyCode.D) ) {
            this.velocityX = speed;
          }

          if (keyboard.isDown(Phaser.KeyCode.SPACEBAR)) {
            this.isRolling = true;
          }
        },
        update: function(player, playerStateMachine) {
          if (this.velocityX === 0 && this.velocityY === 0) {
            playerStateMachine.popState();
            playerStateMachine.pushState(PlayerStateFactory.IDLE());
            return;
          } else if (this.isRolling) {
            var nextState = PlayerStateFactory.ROLL(this.velocityX, this.velocityY);
            playerStateMachine.popState();
            playerStateMachine.pushState(nextState);
            return;
          }
          // reduce speed if moving diagonally so that we don't move super quickly
          if ( this.velocityX && this.velocityY ) {
            player.body.velocity.x = this.velocityX * 0.66;
            player.body.velocity.y = this.velocityY * 0.66;
          } else {
            player.body.velocity.x = this.velocityX;
            player.body.velocity.y = this.velocityY;
          }

          var moveAnimation = PlayerAnimUtil.getDirectionString(this.cursorAngle);
          player.weaponManager.update(this.cursorAngle);
          player._main.animations.play(moveAnimation);
        },
        onFire: function(player, input) {
          player.weaponManager.fire(input);
        },
        resolve: function() {
          this.isRolling = false;
          this.cursorAngle = 0.0;
          this.velocityX = 0;
          this.velocityY = 0;
          PlayerStateFactory._runPool.push(this);
        },
      };
    }
    return state;
  },
  _rollPool: [],
  ROLL: function(moveX = 0, moveY = 0) {
    var speed = 140;
    if (moveX && moveY) {
      speed *= 0.66;
    }
    var state = null;
    if (this._rollPool.length > 0) {
      state = this._rollPool.pop();
      state.isComplete = false;
      state.velocityX = Math.sign(moveX) * speed;
      state.velocityY = Math.sign(moveY) * speed;
    } else {
      state = {
        name: "ROLL",
        isComplete: false,
        velocityX: Math.sign(moveX) * speed,
        velocityY: Math.sign(moveY) * speed,
        enter: function(player) {
          player.body.velocity.x = this.velocityX;
          player.body.velocity.y = this.velocityY;
          var animName = "roll_right";
          if (this.velocityY > 0) {
            animName = "roll_down";
          } else if (this.velocityY < 0) {
            animName = "roll_up";
          }

          if (this.velocityX > 0) {
            animName = "roll_right";
          } else if (this.velocityX < 0) {
            animName = "roll_left";
          }
          player._main.animations.play(animName);
          player._main.animations.currentAnim.onComplete.addOnce(this.onComplete, this);
          player.weaponManager.update(0, isVisible = false);
        },
        handleInput: function(input) {
          return;
        },
        update: function(player, playerStateMachine) {
          if (this.isComplete) {
            var nextState = PlayerStateFactory.RECOVER(this.velocityX, this.velocityY);
            playerStateMachine.popState();
            playerStateMachine.pushState(nextState);
            return;
          }
        },
        onFire: function(player, input) {
          return;
        },
        onComplete: function() {
          this.isComplete = true;
        },
        resolve: function() {
          this.isComplete = false;
          this.velocityX = 0;
          this.velocityY = 0;
          PlayerStateFactory._rollPool.push(this);
        },
      };
    }
    return state;
  },
  _recoverPool: [],
  RECOVER: function(moveX = 0, moveY = 0) {
    var speed = 50;
    if (moveX && moveY) {
      speed *= 0.66;
    }
    var state = null;
    if (this._recoverPool.length > 0) {
      state = this._recoverPool.pop();
      state.isComplete = false;
      state.velocityX = Math.sign(moveX) * speed;
      state.velocityY = Math.sign(moveY) * speed;
    } else {
      state = {
        name: "RECOVER",
        isComplete: false,
        velocityX: Math.sign(moveX) * speed,
        velocityY: Math.sign(moveY) * speed,
        enter: function(player) {
          player.body.velocity.x = this.velocityX;
          player.body.velocity.y = this.velocityY;
          var animName = "recover_right";
          if (this.velocityY > 0) {
            animName = "recover_down";
          } else if (this.velocityY < 0) {
            animName = "recover_up";
          }

          if (this.velocityX > 0) {
            animName = "recover_right";
          } else if (this.velocityX < 0) {
            animName = "recover_left";
          }
          player._main.animations.play(animName);
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
        resolve: function() {
          this.isComplete = false;
          PlayerStateFactory._recoverPool.push(this);
        },
      };
    }
    return state;
  },
  _fallPool: [],
  FALL: function(onComplete, onCompleteContext = null) {
    var state = null;
    if (this._fallPool.length > 0) {
      state = this._fallPool.pop();
      state.onComplete = onComplete;
      state.onCompleteContext = onCompleteContext;
    } else {
      state = {
        name: "FALL",
        onComplete: onComplete,
        onCompleteContext: onCompleteContext,
        enter: function(player) {
          player.body.velocity.x = 0;
          player.body.velocity.y = 0;
          player._main.animations.play("fall");
          player._main.animations.currentAnim.onComplete.addOnce(this.onComplete, this.onCompleteContext);
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
        resolve: function() {
          PlayerStateFactory._fallPool.push(this);
        },
      };
    }
    return state;
  },
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
