/* global: CocoonJS, game */

var social = {

    // is cocoonjs active
    hasCocoon: (typeof CocoonJS !== "undefined" && CocoonJS.nativeExtensionObjectAvailable !== false),

    socialService: null,

    leaderboard: null,

    gs: null,

    init: function (leaderboard) {
        "use strict";

        if (this.hasCocoon) {
            if (leaderboard) {
                this.leaderboard = leaderboard;
            }

            if (game.device.iOS) {
                this.gs = CocoonJS.Social.GameCenter;
            }
            if (game.device.android) {
                this.gs = CocoonJS.Social.GooglePlayGames;
                this.gs.init({defaultLeaderboard: this.leaderboard});
            }

            this.socialService = this.gs.getSocialInterface();
        } else {
            return;
        }
    },

    // check if the user is logged in or not
    isLoggedIn: function () {
        "use strict";

        if (! this.hasCocoon) {
            return false;
        }

        return this.socialService.isLoggedIn();
    },

    // ask the user to login
    login: function (callback) {
        "use strict";

        if (! this.hasCocoon || this.isLoggedIn()) {
            return;
        }

        try {
            this.socialService.login(callback);
        } catch (e) {
            console.error("Login error: " + e.message);
            return;
        }
    },

    // post a score to the registered leaderboard
    postScore: function (score) {
        "use strict";

        if (! this.hasCocoon || ! this.isLoggedIn()) {
            return;
        }

        var params = new CocoonJS.Social.ScoreParams(null, this.leaderboard);

        try {
            this.socialService.submitScore(score, function (error) {
                if (error) {
                    console.error("Post Score error 1: " + error.message);
                }
            }, params);
        } catch (e) {
            console.error("Post Score error 2: " + e.message);
            return;
        }
    },

    // post a score to the registered leaderboard
    getScore: function () {
        "use strict";

        if (! this.hasCocoon || ! this.isLoggedIn()) {
            console.log('getScore, not logged in');
            return;
        }

        console.log('Try to getScore');

        try {
            var score = this.socialService.requestScore(function (error) {
                if (error) {
                    console.error("Score request error: " + error.message);
                }

                console.log('getScore error', error);
            });

            console.log('getScore', score);

            return score;
        } catch (e) {
            console.error("submitAchievement error: " + e.message);
            return;
        }
    },

    // display the leaderboard
    showLeaderboard: function (opponent) {
        "use strict";

        if (! this.hasCocoon || ! this.isLoggedIn()) {
            return;
        }

        var params = new CocoonJS.Social.ScoreParams(null, this.leaderboard);

        try {
            this.socialService.showLeaderboard(function (error) {
                if (error) {
                    console.error("showLeaderbord error: " + error.message);
                }
            }, params);
        } catch (e) {
            console.error("submitAchievement error: " + e.message);
            return;
        }
    },

    // display the achievements
    showAchievements: function () {
        "use strict";

        if (! this.hasCocoon || ! this.isLoggedIn()) {
            return;
        }

        try {
            this.socialService.showAchievements();
        } catch (e) {
            console.error("submitAchievement error: " + e.message);
            return;
        }
    },

    // get an achievement for performing an action
    winAchievement: function (achievement) {
        "use strict";

        if (! this.hasCocoon || ! this.isLoggedIn()) {
            return;
        }

        try {
            this.socialService.submitAchievement(achievement, function (error) {
                if (error) {
                    console.error("submitAchievement error: " + error.message);
                }
            });
        } catch (e) {
            console.error("submitAchievement error: " + e.message);
            return;
        }
    },

    // get an achievement for performing an action
    rate: function () {
        "use strict";

        if (! this.hasCocoon) {
            return;
        }

        try {
            // do the codez
        } catch (e) {
            console.error("rating error: " + e.message);
            return;
        }
    }
};
