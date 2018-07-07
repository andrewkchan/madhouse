/* global game, Phaser */

/**
 * TODO
 * ---
 * enemies
 * more scrolls
 */


var playState = {

    player_speed: 0,

    player_speed_bonus: 9,

    tile_size: 8,

    width: 128,

    height: 128,

    home_location: null,

    milk_required: 3,

    milk_found: 0,

    story_scroll: {
        1: "Hey Dad, I'm\nthirsty. Can\nyou get me\nsome milk?\n-baby Seb",
        2: "The key is\nin the shed.\n-Mum",
        3: "Here lies the\nFairy Queen.\nShe will never\nbe forgotten",
        4: "What are those\ndark patches\nin the water?",
        5: "Keep OFF\nthe grass!",
        6: "Your milk\nis in another\ncastle!",
        7: "How did this\nget here?",
        8: "I lost the\nkey on the\nisland",
        9: "The Glade",
        10: "Here lies the\nFairy King.\nHe didn't like\nthe Fairy Queen",
        11: "Follow me on\nTwitter:\n@binarymoon",
        12: "Made by Ben\nGillbanks in\n5 days. For\n#lowrezjam",
        13: "Well Done!",
    },

    game_over: false,

    tween: false,

    display_scroll: false,

    font_set: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:?!-_\'#"\\/<>()@',

    time_limit: Phaser.Timer.MINUTE * 2 + Phaser.Timer.SECOND * 30,
    //time_limit: Phaser.Timer.SECOND * 5,

    /**
     * Create game world
     */
    create: function () {

        // add object groups - used for looping through objects and for setting z-order
        this.groupLevel = this.add.group();
        this.groupDrinks = this.add.group();
        this.groupKeys = this.add.group();
        this.groupDoors = this.add.group();
        this.groupScrolls = this.add.group();
        this.groupMilk = this.add.group();
        this.groupElements = this.add.group();
        this.groupHud = this.add.group();

        // fix hud to camera
        this.groupHud.fixedToCamera = true;

        // setup arcade physics
        game.physics.startSystem( Phaser.Physics.ARCADE );
        game.physics.arcade.TILE_BIAS = 8;

        // cursor controls
        this.cursor = this.game.input.keyboard.createCursorKeys();
        this.keyboard = this.game.input.keyboard;

        // setup baby
        this.baby = this.game.add.sprite( 0, 0, 'baby' );
        this.baby.anchor.setTo( 0.5, 0.5 );

        // baby animations
        this.baby.animations.add( 'happy', [ 0, 1, 0, 2 ], 2, true );
        this.baby.animations.add( 'sad', [ 3, 4, 3, 5 ], 6, true );
        this.baby.animations.play( 'sad' );
        this.groupElements.add( this.baby );

        // setup player
        // TODO: set character start position in level parameters
        // this.player = this.game.add.sprite( 0, 0, 'player' );
        this.player = this.game.add.sprite(0, 0, 'convict');
        this.player.anchor.setTo( 0.5, 0.5 );
        this.player.direction = 2;
        this.player.alive = true;

        // player animations
        this.player.animations.add('down', [18, 19, 20, 21, 22], 12, true);
        this.player.animations.add('up', [23, 24, 25, 26, 27, 28], 12, true);
        this.player.animations.add('right', [4, 5, 6, 7, 8], 12, true);
        this.player.animations.add('left', [72, 73, 74, 75, 76], 12, true);
        this.player.animations.add('idle_down', [46, 47, 48], 2, true);
        // this.player.animations.add( 'down', [ 0, 1, 0, 2 ], 4, true );
        // this.player.animations.add( 'up', [ 3, 4, 3, 5 ], 4, true );
        // this.player.animations.add( 'right', [ 6, 7, 8 ], 4, true );
        // this.player.animations.add( 'left', [ 9, 10, 11 ], 4, true );

        this.groupElements.add( this.player );

        game.physics.arcade.enable( this.player );
        this.player.body.setSize( 6, 10, 0, 10 );
        this.player.body.tilePadding.set( 12, 12 );

        // baby thought bubble
        this.baby_thought = this.game.add.sprite( 0, 0, 'baby-thoughts' );
        this.baby_thought.anchor.setTo( 0.5, 0.5 );
        this.baby_thought.frame = 1;
        this.baby_thought.visible = false;
        this.groupElements.add( this.baby_thought );

        // setup message overlay
        this.message_overlay = this.game.add.sprite( 0, this.height + 5, 'overlay' );
        this.message_overlay.alpha = 0.8;
        this.groupHud.add( this.message_overlay );

        // setup message text
        this.message = this.game.add.retroFont( 'font', 4, 6, this.font_set, 8, 3, 1, 2, 1 );
        this.message.autoUpperCase = false;
        this.message_image = this.game.add.image( this.width / 2, this.height + 5, this.message );
        this.message_image.anchor.setTo( 0.5, 0.5 );
        this.groupHud.add( this.message_image );

        // timer
        this.timer_overlay = this.game.add.sprite( this.width - 21, 7, 'overlay' );
        this.timer_overlay.alpha = 0.8;
        this.timer_overlay.anchor.setTo( 0, 1 );
        this.groupHud.add( this.timer_overlay );

        this.timer_text = this.game.add.retroFont( 'font', 4, 6, this.font_set, 8, 3, 1, 2, 1 );
        this.timer_image = this.game.add.image( this.width, 1, this.timer_text );
        this.timer_image.anchor.setTo( 1, 0 );
        this.timer_text.text = '2:00';
        this.groupHud.add( this.timer_image );

        // Create a delayed event 2m and 30s from now
        this.timer = game.time.create();
        this.timerEvent = this.timer.add( this.time_limit, this.timer_end, this );
        this.timer.start();

        // setup game overlay
        this.overlay = this.game.add.sprite( 0, 0, 'overlay' );
        this.overlay.alpha = 0;
        this.groupHud.add( this.overlay );

        // setup overlay text
        // characterWidth, characterHeight, chars, charsPerRow, xSpacing, ySpacing, xOffset, yOffset)
        this.overlay_text = this.game.add.retroFont( 'font', 4, 6, this.font_set, 8, 3, 1, 2, 1 );
        this.overlay_text.multiLine = true;
        this.overlay_text.autoUpperCase = false;
        this.overlay_image = this.game.add.image( this.width / 2, this.height / 2, this.overlay_text );
        this.overlay_image.alpha = 0;
        this.overlay_image.anchor.setTo( 0.5, 0.5 );
        this.groupHud.add( this.overlay_image );

        // reset settings
        this.camera = { x: 0, y: 4 };
        this.player_speed = 80;
        this.milk_required = 0;
        this.milk_found = 0;
        this.game_over = false;
        this.tween = false;
        this.display_scroll = false;

        // share button
        this.share = this.game.add.sprite( 0, 0, 'share' );
        this.share.inputEnabled = true;
        this.share.events.onInputDown.add( this.share_button, this );
        this.groupElements.add( this.share );

        // load level
        this.load_map();

    },


    /**
     * Update game
     */
    update: function() {

        game.physics.arcade.collide( this.player, this.layer );
        game.physics.arcade.collide( this.player, this.groupDoors );

        game.physics.arcade.overlap( this.player, this.groupKeys, this.key_take, null, this );
        game.physics.arcade.overlap( this.player, this.groupMilk, this.milk_take, null, this );
        game.physics.arcade.overlap( this.player, this.groupDrinks, this.drink_take, null, this );
        game.physics.arcade.overlap( this.player, this.groupScrolls, this.scroll_display, null, this );

        this.player_movements();
        this.camera_movements();
        this.scroll_update();
        this.timer_update();
        this.game_update();
    },


    /**
     * Score Share Button
     */
    share_button: function() {

        var time_elapsed = Math.abs( this.time_limit - this.timerEvent.delay - this.timer.ms );
        time_elapsed = this.time_format( Math.round( time_elapsed / 1000 ) );

        var url = 'https://twitter.com/intent/tweet';
        url += '?text=' + encodeURI( 'I just finished the game "The Legend of Dad" in ' + time_elapsed + ' -');
        url += '&via=binarymoon';
        url += '&url=' + encodeURI( 'https://binarymoon.itch.io/the-legend-of-dad-quest-for-milk' );

        window.open( url, '_blank' );

    },


    /**
     * Update the clock
     */
    timer_update: function() {

        var time_remaining = Math.round( ( this.timerEvent.delay - this.timer.ms ) / 1000 );

        if ( this.timer.running ) {

            this.timer_text.text = this.time_format( time_remaining );

        } else {

            this.game_lost();

        }

        if ( time_remaining < 30 ) {

            this.baby_thought.visible = true;

        }

    },


    /**
     * Stop the timer
     */
    timer_end: function() {

        this.timer.stop();

    },


    /**
     * Format a time into minutes and seconds
     *
     * @param   {string} s Time in seconds
     * @returns {string} A nicely formatted string showing the time remaining
     */
    time_format: function( s ) {

        var minutes = "0" + Math.floor( s / 60 );
        var seconds = "0" + ( s - minutes * 60 );
        return minutes.substr( -2 ) + ":" + seconds.substr( -2 );

    },


    /**
     * Action to perform when a player overlaps a scroll
     *
     * @param {object} player The player that has collided with the scroll
     * @param {object} scroll The scroll that has been interacted with
     */
    scroll_display: function( player, scroll ) {

        this.display_scroll = true;

        // is in the process of displaying so skip the rest
        if ( this.overlay.alpha > 0 ) {
            return;
        }

        // leave if the scroll does not have an id set
        if ( typeof scroll.scroll_id == 'undefined' ) {
            return;
        }

        var scroll_text = this.story_scroll[ scroll.scroll_id ];

        if ( scroll_text ) {
            this.overlay_new( scroll_text );
        }

    },


    /**
     * Display a full screen overlay with a message in the middle
     *
     * @param {string} message The message to display on the overlay
     * @param {number} speed   The number of milliseconds to fade in the overlay
     * @param {number} opacity The opacity of the overlay
     */
    overlay_new: function( message, speed, opacity ) {

        // stop scrolls from overwriting the game over message
        if ( this.game_over ) {
            return;
        }

        if ( ! speed ) {
            speed = 150;
        }

        if ( ! opacity ) {
            opacity = 0.8;
        }

        // set overlay message
        this.overlay_text.text = message;

        // add tweens
        game.add.tween( this.overlay ).to( { alpha: opacity }, speed ).start();
        game.add.tween( this.overlay_image ).to( { alpha: 1 }, speed ).start();

    },


    /**
     * Hide the overlay
     */
    overlay_hide: function() {

        game.add.tween( this.overlay ).to( { alpha: 0 }, 100 ).start();
        game.add.tween( this.overlay_image ).to( { alpha: 0 }, 100 ).start();

    },


    /**
     * Update scroll display status
     */
    scroll_update: function() {

        if ( ! this.display_scroll && ! this.game_over ) {
            this.overlay_hide();
        }

        this.display_scroll = false;

    },


    /**
     * Pick up a key
     *
     * @param {[[Type]]} player [[Description]]
     * @param {object}   key    [[Description]]
     */
    key_take: function( player, key ) {

        this.door_open( key );
        key.kill();

    },


    /**
     * Open a door with a key
     *
     * @param {[[Type]]} id [[Description]]
     */
    door_open: function( key ) {

        // leave if the key does not have an id set
        if ( typeof key.key_id == 'undefined' ) {
            return;
        }

        // open door
        var id = key.key_id;

        // loop through all doors and remove any that match the id of the key
        this.groupDoors.forEach(
            function( d ) {

                if ( d.key_id == id ) {

                    var t = game.add.tween( d.scale ).to( { x: 0, y: 0 }, 300 ).start();
                    t.onComplete.add( function() { this.kill(); }, d );

                }

            },
            this
        );

        // update message

        // leave if the key does not have a message set
        if ( typeof key.key_message == 'undefined' ) {
            return;
        }

        this.message_new( key.key_message );

    },


    /**
     * The player picks up a milk bottle
     *
     * @param object player The player object
     * @param object milk  The heart object
     */
    milk_take: function( player, milk ) {

        if ( ! milk.alive ) {
            return;
        }

        milk.alive = false;
        milk.kill();

        this.milk_found ++;

        this.message_new( this.milk_found + ' of ' + this.milk_required + ' milk' );

        this.key_take( player, milk );

        if ( this.milk_found >= this.milk_required ) {

            this.milk_collected();

        }

    },


    /**
     * The player picks up an energy drink and moves faster
     *
     * @param object player The player object
     * @param object drink  The heart object
     */
    drink_take: function( player, drink ) {

        drink.kill();

        this.player_speed += this.player_speed_bonus;

        var message = 'faster';

        if ( typeof drink.message !== 'undefined' ) {
            message = drink.message;
        }

        this.message_new( message );

    },


    /**
     * A function for displaying short messages at the bottom of the screen
     *
     * @param {string} message A message to display
     */
    message_new: function( message ) {

        if ( ! message ) {
            return;
        }

        this.message.text = message;

        game.add.tween( this.message_image ).to( { y: this.height - 5 }, 150 ).start();
        game.add.tween( this.message_overlay ).to( { y: this.height - 10 }, 150 ).start();

        game.time.events.add(
            Phaser.Timer.SECOND * 2.5,
            function() {
                game.add.tween( this.message_image ).to( { y: this.height + 5 }, 150 ).start();
                game.add.tween( this.message_overlay ).to( { y: this.height + 5 }, 150 ).start();
            },
            this
        );


    },


    /**
     * Position camera based upon users position
     */
    camera_movements: function() {

        if ( this.tween ) {
            return;
        }

        this.tween = true;
        var speed = 400;
        var to_move = false;

        if ( this.player.y > game.camera.y + this.height ) {

            this.camera.y += 1;
            to_move = true;

        }
        if ( this.player.y < game.camera.y ) {

            this.camera.y -= 1;
            to_move = true;

        }
        if ( this.player.x > game.camera.x + this.width ) {

            this.camera.x += 1;
            to_move = true;

        }
        if ( this.player.x < game.camera.x ) {

            this.camera.x -= 1;
            to_move = true;

        }

        // if the camera should move then run the tween
        if ( to_move ) {

            var t = game.add.tween( game.camera ).to(
                {
                    x: this.camera.x * this.width,
                    y: this.camera.y * this.height
                },
                speed
            );

            t.start();

            t.onComplete.add(
                function() {
                    console.log("Done!!!!! tweening!!");
                    this.tween = false;
                },
                this
            );

        } else {

            this.tween = false;

        }

    },


    /**
     * Move player
     */
    player_movements: function() {

        // default properties
        var speed = this.player_speed;
        var move_x = false;
        var move_y = false;
        var move_animation = 'idle_down';

        // slow down speed if camera is moving
        if ( this.tween ) {
            speed = speed / 2;
        }

        // reset velocity
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;

        // take care of character movement
        if ( this.keyboard.isDown(Phaser.KeyCode.W) ) {

            this.player.body.velocity.y = -speed;
            this.player.direction = 1;

            move_animation = 'up';
            move_y = true;

        } else if ( this.keyboard.isDown(Phaser.KeyCode.S) ) {

            this.player.body.velocity.y = speed;
            this.player.direction = 2;

            move_animation = 'down';
            move_y = true;

        }

        if ( this.keyboard.isDown(Phaser.KeyCode.A) ) {

            this.player.body.velocity.x = -speed;
            this.player.direction = 4;

            move_animation = 'left';
            move_x = true;

        } else if ( this.keyboard.isDown(Phaser.KeyCode.D) ) {

            this.player.body.velocity.x = speed;
            this.player.direction = 3;

            move_animation = 'right';
            move_x = true;

        }

        // if there's a special animation
        if ( move_animation ) {
          this.player.animations.play( move_animation );
        }

        // reduce speed if moving diagonally so that we don't move super quickly
        if ( move_x && move_y ) {
          this.player.body.velocity.x = this.player.body.velocity.x * 0.66;
          this.player.body.velocity.y = this.player.body.velocity.y * 0.66;
        }
    },


    /**
     * Load level
     */
    load_map: function() {

        // setup map
        this.map = game.add.tilemap( 'map1' );
        this.map.addTilesetImage( 'tiles' );
        this.map.setCollisionBetween( 1, 32 );

        // add map layers
        this.layer = this.map.createLayer( 'tiles' );
        this.layer.resizeWorld();
        this.layer_details = this.map.createLayer( 'details' );

        // add layers to group so they display in the correct order
        this.groupLevel.add( this.layer );
        this.groupLevel.add( this.layer_details );

        // 58 - energy drink
        // 59 - heart
        // 60 - key
        // 61 - door
        // 62 - scroll
        // 63 - milk
        // 64 - start

        //this.map.createFromObjects( name,   gid, key,   frame, exists, autoCull, group, CustomClass, adjustY )
        this.map.createFromObjects( 'objects', 58, 'tilemap', 57, true, false, this.groupDrinks );
        this.map.createFromObjects( 'objects', 60, 'tilemap', 59, true, false, this.groupKeys );
        this.map.createFromObjects( 'objects', 61, 'tilemap', 60, true, false, this.groupDoors );
        this.map.createFromObjects( 'objects', 62, 'tilemap', 61, true, false, this.groupScrolls );
        this.map.createFromObjects( 'objects', 63, 'tilemap', 62, true, false, this.groupMilk );

        // position player
        var player_position = this.findObjectsByType( 'start', this.map, 'objects' );

        if ( player_position[0] ) {

            // use the first result - there should only be 1 start point per level
            // if there isn't we'll just ignore the others
            this.player.x = player_position[0].x + ( this.tile_size / 2 );
            this.player.y = player_position[0].y + 2;

            this.camera.x = Math.floor( this.player.x / this.width );
            this.camera.y = Math.floor( this.player.y / this.height );

            // position camera
            // game.camera.x = this.camera.x * this.width;
            // game.camera.y = this.camera.y * this.height;
            game.camera.follow(this.player);
        }

        // position baby
        var baby_position = this.findObjectsByType( 'baby', this.map, 'objects' );

        if ( baby_position[0] ) {

            // use the first result - there should only be 1 start point per level
            // if there isn't we'll just ignore the others
            this.baby.x = baby_position[0].x + ( this.tile_size / 2 );
            this.baby.y = baby_position[0].y - 1;

            this.baby_thought.x = this.baby.x + 4;
            this.baby_thought.y = this.baby.y - 11;

        }

        // share button
        var share_position = this.findObjectsByType( 'share', this.map, 'objects' );

        if ( share_position[0] ) {

            // use the first result - there should only be 1 start point per level
            // if there isn't we'll just ignore the others
            this.share.x = share_position[0].x;
            this.share.y = share_position[0].y;

        }

        // home location
        this.home_location = this.findObjectsByType( 'home', this.map, 'overlay' );
        this.home_location = this.home_location[0];

        // enable keys
        this.groupKeys.forEach(
            function( d ) {

                game.physics.arcade.enable( d );

            },
            this
        );

        // enable drinks
        this.groupDrinks.forEach(
            function( d ) {

                game.physics.arcade.enable( d );

            },
            this
        );

        // enable scrolls
        this.groupScrolls.forEach(
            function( s ) {

                game.physics.arcade.enable( s );

            },
            this
        );

        // enable milk
        this.groupMilk.forEach(
            function( m ) {

                this.milk_required ++;
                m.alive = true;
                game.physics.arcade.enable( m );

            },
            this
        );

        // add doors
        this.groupDoors.forEach(
            function( d ) {

                game.physics.arcade.enable( d );
                d.body.immovable = true;
                d.anchor.setTo( 0.5, 0.5 );
                d.x += d.width / 2;
                d.y += d.height / 2;

            },
            this
        );


    },

    /**
     * Find objects in a Tiled layer that contain a property called "type" equal to a certain value
     *
     * @param   string     type   The object type to find, as specified in the map file
     * @param   object     map    Tilemap bject
     * @param   string     layer  Key for object layer to search
     * @returns array      List of objects
     */
    findObjectsByType: function( type, map, layer ) {

        var result = new Array();

        map.objects[layer].forEach(
            function( element ) {

                if ( typeof element.properties !== 'undefined' ) {

                    if ( typeof element.properties.type !== 'undefined' && element.properties.type === type ) {

                        //Phaser uses top left, Tiled bottom left so we have to adjust the y position
                        //also keep in mind that the cup images are a bit smaller than the tile which is 16x16
                        //so they might not be placed in the exact pixel position as in Tiled
                        element.y -= map.tileHeight;
                        result.push( element );

                    }

                }
            }
        );

        return result;

    },


    /**
     * Game complete
     *
     * Change baby so that he is happy, and add a go home message, and maybe some other decorations in the house
     */
    milk_collected: function() {

        this.house_party();

        this.baby.animations.play( 'happy' );

        this.baby_thought.frame = 0;

        game.time.events.add(
            Phaser.Timer.SECOND * 3,
            function() {
                this.message_new( 'Go Home >>' );
            },
            this
        );

    },


    /**
     * Release confetti in the home to make it a happier place
     */
    house_party: function() {

        var emitter = game.add.emitter( this.home_location.x + ( this.width / 2 ), this.home_location.y, 100 );
        emitter.makeParticles( 'confetti', [ 0, 1, 2, 3 ] );
        emitter.y = emitter.y + ( this.tile_size * 2 );
        emitter.width = this.home_location.width - this.tile_size;
        emitter.height = this.tile_size;
        emitter.setYSpeed( 20, 40 );
        emitter.setXSpeed( 0, 0 );
        emitter.gravity = 0;
        this.groupElements.add( emitter );

        emitter.start( false, 1500, 70 );

    },


    /**
     * Game completed. Now we can stop the timer and let the user wander around the world
     */
    game_finished: function() {

        this.timer.pause();
        this.baby_thought.visible = true;
        this.door_open( { key_id: 7 } );

    },


    /**
     * Game over - have to try again
     */
    game_lost: function() {

        this.overlay_new( 'Too Slow :(', 1000, 1 );

        this.game_over = true;

        // quit to menu
        game.time.events.add(
            Phaser.Timer.SECOND * 5,
            function() {
                game.state.start( 'menu' );
            },
            this
        );

    },


    /**
     * update game settings
     */
    game_update: function() {

        // if all milk is collected
        if ( this.milk_found >= this.milk_required ) {

            // if player is in home
            if ( this.player.x > this.home_location.x && this.player.x < this.home_location.x + this.home_location.width ) {
                if ( this.player.y > this.home_location.y && this.player.y < this.home_location.y + this.home_location.height ) {

                    this.game_finished();
                    this.message_new( 'Yay!' );

                }
            }

        }

    },

    render: function() {
      //game.debug.body( this.player );
    }

};
