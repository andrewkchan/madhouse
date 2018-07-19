var GameInputUtil = {
  getCursorAngle: function(input) {
    // get the angle of the cursor (in radians) relative to the center of the screen
    // note since positive y is "down", down means a positive angle.
    var relPos = this.getCursorRelativePosition(input);
    return Math.atan2(relPos.y, relPos.x);
  },
  getCursorRelativePosition: function(input) {
    // get the {x, y} coordinates of the cursor relative to the center of the screen
    return {
      x: input.x - game.width/2,
      y: input.y - game.height/2
    };
  },
  isFiring: function(input) {
    return input.activePointer.leftButton.isDown;
  },
  isMoving: function(input) {
    return Boolean(
      input.keyboard.isDown(Phaser.KeyCode.W) ||
      input.keyboard.isDown(Phaser.KeyCode.S) ||
      input.keyboard.isDown(Phaser.KeyCode.A) ||
      input.keyboard.isDown(Phaser.KeyCode.D)
    );
  },
};

var MathUtil = {
  isUp: function(angle) {
    return -3*Math.PI/4 < angle && angle <= -Math.PI/4;
  },
  isDown: function(angle) {
    return Math.PI/4 < angle && angle <= 3*Math.PI/4;
  },
  isRight: function(angle) {
    return -Math.PI/4 < angle && angle <= Math.PI/4;
  },
  isLeft: function(angle) {
    return Math.abs(angle) > 3*Math.PI/4;
  }
};

var StateMachineUtil = {
  createStateMachine: function(actor) {
    var stateStack = [];
    return {
      pushState: function(state) {
        stateStack.push(state);
        state.enter(actor);
      },
      popState: function() {
        return stateStack.pop();
      },
      peekState: function() {
        return stateStack[stateStack.length - 1];
      }
    };
  },
};
