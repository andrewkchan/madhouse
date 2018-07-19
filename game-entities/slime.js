REPATH_FRAMES = 30;
SLIME_JUMP_SPEED = 90;
SLIME_MAX_JUMP_DURATION = 0.8;

function Slime(player) {
  Actor.call(this, 'slime', 0, 0, 'slime');
  SlimeAnimUtil.initSpriteWithAnims(this);
  SlimeBodyUtil.initSpriteWithBody(game, this);
  this.health = 100;
  this.botControlled = true;

  this.bodyStateMachine = StateMachineUtil.createStateMachine(this);
  this.bodyStateMachine.pushState(SlimeStateFactory.IDLE());

  // AI stuff
  this.navMesh = null;
  this.player = player;
  this.repathCountdown = REPATH_FRAMES;
}
Slime.prototype = Object.create(Actor.prototype);
Slime.prototype.constructor = Slime;

Slime.prototype.update = function() {
  Actor.prototype.update.call(this);
  this.bodyStateMachine.peekState().update(this, this.bodyStateMachine);
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
  // this.bodyStateMachine.popState();
  // this.bodyStateMachine.pushState(SlimeStateFactory.IDLE(0));
};
Slime.prototype.flash = function(isFlashing) {
  this.alpha = isFlashing ? 0.3 : 1.0;
};
Slime.prototype.moveTowards = function(target) {
  // can only begin movement if in state IDLE
  if (this.bodyStateMachine.peekState().name !== "IDLE") {
    return;
  }
  // Assume we have a straight path to the target.
  var angle = this.position.angle(target);
  var dist = this.position.distance(target);
  var jumpDuration = Math.min(dist / SLIME_JUMP_SPEED, SLIME_MAX_JUMP_DURATION);
  this.bodyStateMachine.popState();
  this.bodyStateMachine.pushState(SlimeStateFactory.CROUCH(angle, jumpDuration));
};
Slime.prototype.collideWith = function(actor) {
  actor.takeDamage(5);
};

// Factory for Slime state objects.
// ===============================
// a slime state object contains functions:
// enter - called when the state is entered.
// update - called so the state can update the slime object.
// ================================
// slime state objects also contain public members:
// name - string name of the state.
var SlimeStateFactory = {
  IDLE: function(angle) {
    return {
      name: "IDLE",
      enter: function(actor) {
        actor.body.velocity.x = 0;
        actor.body.velocity.y = 0;
        if (-Math.PI/2 <= angle && angle <= Math.PI/2) {
          actor.animations.play("idle_right");
        } else {
          actor.animations.play("idle_left");
        }
      },
      update: function(actor, stateMachine) {
        return;
      },
    };
  },
  CROUCH: function(angle, jumpDuration) {
    var isComplete = false;
    return {
      name: "CROUCH",
      enter: function(actor) {
        if (-Math.PI/2 <= angle && angle <= Math.PI/2) {
          actor.animations.play("crouch_right");
        } else {
          actor.animations.play("crouch_left");
        }
        actor.animations.currentAnim.onComplete.addOnce(this.onComplete, this);
      },
      update: function(actor, stateMachine) {
        if (isComplete) {
          stateMachine.popState();
          stateMachine.pushState(SlimeStateFactory.JUMP(angle, jumpDuration));
        }
      },
      onComplete: function() {
        isComplete = true;
      },
    };
  },
  JUMP: function(angle, duration) {
    var speed = SLIME_JUMP_SPEED;
    return {
      name: "JUMP",
      enter: function(actor) {
        actor.body.velocity.x = speed * Math.cos(angle);
        actor.body.velocity.y = speed * Math.sin(angle);
        if (-Math.PI/2 <= angle && angle <= Math.PI/2) {
          actor.animations.play("jump_right");
        } else {
          actor.animations.play("jump_left");
        }
      },
      update: function(actor, stateMachine) {
        duration -= game.time.physicsElapsed;
        if (duration <= 0.0) {
          stateMachine.popState();
          stateMachine.pushState(SlimeStateFactory.LAND(angle));
        }
      },
    };
  },
  LAND: function(angle) {
    var isComplete = false;
    return {
      name: "LAND",
      enter: function(actor) {
        actor.body.velocity.x = 0;
        actor.body.velocity.y = 0;
        if (-Math.PI/2 <= angle && angle <= Math.PI/2) {
          actor.animations.play("land_right");
        } else {
          actor.animations.play("land_left");
        }
        actor.animations.currentAnim.onComplete.addOnce(this.onComplete, this);
      },
      update: function(actor, stateMachine) {
        if (isComplete) {
          stateMachine.popState();
          stateMachine.pushState(SlimeStateFactory.IDLE());
        }
      },
      onComplete: function() {
        isComplete = true;
      },
    };
  },
};

var SlimeAnimUtil = {
  initSpriteWithAnims: function(slime) {
    slime.anchor.setTo(0.5, 0.5);

    slime.animations.add('idle_left', [0], 1, true);
    slime.animations.add('crouch_left', [0, 1, 2], 4, false);
    slime.animations.add('jump_left', [3], 1, true);
    slime.animations.add('land_left', [4, 0], 4, false);
    slime.animations.add('idle_right', [5], 1, true);
    slime.animations.add('crouch_right', [5, 6, 7], 4, false);
    slime.animations.add('jump_right', [8], 1, true);
    slime.animations.add('land_right', [9, 5], 4, false);
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
