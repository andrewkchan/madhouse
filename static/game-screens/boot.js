/* global game, Phaser, social */

var bootState = {
  preload: function () {
    game.load.image( 'progressBar', 'assets/images/loading.png' );

    this.scale.pageAlignHorizontally = true;

    this.scale.pageAlignVertically = true;

    // Make game stretch to fill screen fully
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    // update game scale
    game.scale.refresh();

    // Set a background color and the physic system
    game.stage.backgroundColor = '#45283c';

    game.stage.smoothed = false;

    // Add gamecenter leaderboard support
    social.init( 'leaderboard_1' );

    // Login to gamecenter
    game.global.login();

    //game.context.mozImageSmoothingEnabled = false;
    //game.context.webkitImageSmoothingEnabled = false;
    //game.context.msImageSmoothingEnabled = true;
    //game.context.imageSmoothingEnabled = false;

    console.log( game.context );
  },

  create: function() {
    game.canvas.oncontextmenu = function (e) {
      e.preventDefault();
    };
    // switch to the loading state
    game.state.start( 'load' );
  }
};
