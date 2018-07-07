/* global Phaser, game */

var menuState = {

    create: function() {

        this.game.add.sprite( 0, 0, 'intro' );

        var logo = this.game.add.sprite( 0, 0, 'logo' );
        var tween = game.add.tween( logo ).to( { y: logo.y + 5 }, 1500 );
        tween.yoyo( true );
        tween.repeat( -1 );
        tween.start( true );


        // Start the game when the screen is tapped
        this.input.onDown.addOnce( this.start, this );

    },

    start: function() {

        game.state.start( 'play' );

    }

};
