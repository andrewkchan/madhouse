/* global Phaser, CocoonJS, window, social, localstorage */

// Initialize Phaser
// iphone portrait = 375 x 667
// iphone portrait = 667 x 375

var game = new Phaser.Game( 128, 128, Phaser.CANVAS, '', null, false, false );

// Our 'global' variable
game.global = {

    // game version (can help with debugging)
    version: '0.0.1',

    // debug enabled?
    debug: true,


    // show advertising banner
    showBanner: function () {

        "use strict";

        if ( ! game.device.cocoonJS ) {
            return;
        }

        CocoonJS.Ad.setBannerLayout( CocoonJS.Ad.BannerLayout.BOTTOM_CENTER );
        CocoonJS.Ad.showBanner();

        if ( game.rnd.integerInRange( 0, 100 ) > 40 ) {
            CocoonJS.Ad.showFullScreen();
        }

    },


    // hide advertising banner
    hideBanner: function () {

        "use strict";

        if ( ! game.device.cocoonJS ) {
            return;
        }

        CocoonJS.Ad.hideBanner();

    },


    // login to gamecenter/ google play
    login: function () {

        "use strict";

        if ( ! game.device.cocoonJS ) {
            return;
        }

        var gc = CocoonJS.Social.GameCenter;
        var socialService = gc.getSocialInterface();

        if ( socialService ) {
            socialService.onLoginStatusChanged.addEventListener( function( _loggedIn ) {

                game.global.loggedIn = _loggedIn;

                /**
                gc.submitAchievements([{identifier: "test_achievement", showsCompletionBanner: true, percentComplete:100}], function(error){
                    if (error) {
                        return console.error("Error submittingAchievemnt: " + error);
                    }
                })
                */

            } );

            socialService.login( function( loggedIn, error ) {

                if ( ! loggedIn || error ) {

                    // Tell the user that Game Center is Disabled
                    if ( error.code === 2 ) {

                        // go to gamecenter app
                        CocoonJS.App.onMessageBoxConfirmed.addEventListenerOnce( function(){
                            CocoonJS.App.openURL( 'gamecenter:' );
                        } );

                        CocoonJS.App.showMessageBox(
                            'Game Center Not Signed In',
                            'Please sign into Game Center app to enable leaderboards and achievements',
                            'OK',
                            'Later'
                        );

                    }

                }

            } );

        }

    },


    // link to a web page
    href: function (path) {

        "use strict";

        if ( game.device.cocoonJS ) {
            CocoonJS.App.openURL( path );
        } else {
            window.open( path, '_blank' );
        }

    },


    // save the personal best to be displayed in the game
    setBestScore: function () {

        "use strict";

        var score = this.score;

        if ( game.device.localStorage ) {
            localStorage.setItem( 'top_score', score );
        }

        social.postScore( score );

    },


    // display the best score you got
    getBestScore: function () {

        "use strict";

        var score = 0;

        if ( game.device.localStorage ) {
            score = localStorage.getItem( 'top_score' );
        }

        if ( score === null ) {
            score = 0;
            this.score = score;
            this.setBestScore();
        }

        return score;

    },

};

// Define states
game.state.add( 'boot', bootState );
game.state.add( 'load', loadState );
game.state.add( 'menu', menuState );
game.state.add( 'play', playState );

// Start the "boot" state
game.state.start( 'boot' );
