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
  width: 256,
  height: 144,
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
  display_scroll: false,
  font_set: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:?!-_\'#"\\/<>()@',
  time_limit: Phaser.Timer.MINUTE * 2 + Phaser.Timer.SECOND * 30,

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
    this.player = this.game.add.sprite(0, 0, 'empty_convict'); // invisible sprite as group root
    this.player.anchor.setTo( 0.5, 0.5 );
    this.player.direction = 2;
    this.player.alive = true;

    // player weapon hands and weapon
    this.player._weaponHandR = this.player.addChild(game.make.sprite(4, 8, 'empty_convict_hand'));
    this.player._weaponHandR.anchor.setTo(0.5, 0.5);
    this.player._weaponHandR.pivot.x = -4;
    this.player._weaponHandR._weapon = this.player._weaponHandR.addChild(game.make.sprite(0, 0, 'revolver'));
    this.player._weaponHandR._weapon.anchor.set(0.15, 0.8);
    this.player._weaponHandR._hand = this.player._weaponHandR.addChild(game.make.sprite(0, 0, 'convict_hand'));
    this.player._weaponHandR._hand.anchor.setTo(0.5, 0.5);

    this.player._weaponHandL = this.player.addChild(game.make.sprite(-3, 8, 'empty_convict_hand'));
    this.player._weaponHandL.anchor.setTo(0.5, 0.5);
    this.player._weaponHandL.pivot.x = -3;
    this.player._weaponHandL._weapon = this.player._weaponHandL.addChild(game.make.sprite(0, 0, 'revolver_flipped'));
    this.player._weaponHandL._weapon.anchor.set(0.15, 0.2);
    this.player._weaponHandL._hand = this.player._weaponHandL.addChild(game.make.sprite(0, 0, 'convict_hand'));
    this.player._weaponHandL._hand.anchor.setTo(0.5, 0.5);
    this.player._weaponHandL.visible = false;
    // player visible sprite
    this.player._main = this.player.addChild(game.make.sprite(0, 0, 'convict'));
    this.player._main.anchor.setTo( 0.5, 0.5 );
    //this.player.swapChildren(this.player._weaponHandR, this.player._main);

    // player animations
    this.player._main.animations.add('down', [18, 19, 20, 21, 22], 12, true);
    this.player._main.animations.add('up', [23, 24, 25, 26, 27, 28], 12, true);
    this.player._main.animations.add('right', [4, 5, 6, 7, 8], 12, true);
    this.player._main.animations.add('left', [72, 73, 74, 75, 76], 12, true);
    this.player._main.animations.add('roll_down', [58, 59, 60, 61], 10, false);
    this.player._main.animations.add('roll_up', [49, 50, 51, 52], 10, false);
    this.player._main.animations.add('roll_right', [9, 10, 11, 12], 10, false);
    this.player._main.animations.add('roll_left', [77, 78, 79, 80], 10, false);
    this.player._main.animations.add('recover_down', [62, 63, 64], 12, false);
    this.player._main.animations.add('recover_up', [53, 54, 55], 12, false);
    this.player._main.animations.add('recover_right', [13, 14, 15], 12, false);
    this.player._main.animations.add('recover_left', [81, 82, 83], 12, false);
    this.player._main.animations.add('idle_right', [0, 1, 2], 4, true);
    this.player._main.animations.add('idle_left', [68, 69, 70], 4, true);
    this.player._main.animations.add('idle_down', [46, 47, 48], 4, true);
    this.player._main.animations.add('idle_up', [29, 30, 31], 4, true);
    this.player._main.animations.add('fall', [86, 87, 88, 89], 10, false);

    this.groupElements.add( this.player );

    game.physics.arcade.enable( this.player );
    this.player.body.setSize( 6, 10, 0, 10 );
    this.player.body.tilePadding.set( 12, 12 );

    this.playerStateMachine = (function() {
      var stateStack = [];
      var player = this.player;
      return {
        pushState: function(state) {
          stateStack.push(state);
          state.enter(player);
        },
        popState: function() {
          return stateStack.pop();
        },
        peekState: function() {
          return stateStack[stateStack.length - 1];
        }
      };
    }).call(this);
    this.playerStateMachine.pushState(PlayerStateFactory.IDLE());

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
    this.player_speed = 80;
    this.milk_required = 0;
    this.milk_found = 0;
    this.game_over = false;
    this.display_scroll = false;

    // load level
    this.load_map();
  },


  /**
   * Update game
   */
  update: function() {
    this.playerStateMachine.peekState().handleInput(this.game.input);

    game.physics.arcade.collide( this.player, this.layer );
    game.physics.arcade.collide( this.player, this.groupDoors );

    game.physics.arcade.overlap( this.player, this.groupKeys, this.key_take, null, this );
    game.physics.arcade.overlap( this.player, this.groupMilk, this.milk_take, null, this );
    game.physics.arcade.overlap( this.player, this.groupDrinks, this.drink_take, null, this );
    game.physics.arcade.overlap( this.player, this.groupScrolls, this.scroll_display, null, this );

    this.playerStateMachine.peekState().update(this.player, this.playerStateMachine);

    this.scroll_update();
    this.timer_update();
    this.game_update();
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
   * Load level
   */
  load_map: function() {

    // setup map
    this.map = game.add.tilemap( 'map1' );
    this.map.addTilesetImage( 'tiles' );
    this.map.setCollision([1, 2, 4, 5, 6, 7, 8, 14, 15, 16, 22, 23, 24, 29, 30, 31, 12]);
    // water collision detection
    this.map.setTileIndexCallback(
      [3, 9, 10, 11, 12, 13, 17, 18, 19, 20, 21, 25, 26, 27, 28],
      this.fall_in_pit,
      this
    );

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
      game.camera.follow(this.player);
      game.camera.bounds = null;
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

  fall_in_pit: function(sprite, tile) {
    if (tile.containsPoint(sprite.body.center.x, sprite.body.center.y)) {
      if (sprite === this.player) {
        var currentState = this.playerStateMachine.peekState();
        if (currentState.name !== "FALL" && currentState.name !== "ROLL") {
          var fallToDeathState =
            PlayerStateFactory.FALL(function() {
              this.game_lost();
            }, this);
          this.playerStateMachine.popState();
          this.playerStateMachine.pushState(fallToDeathState);
        }
      }
    }
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
    this.overlay_new( 'You lost :(', 1000, 1 );

    this.game_over = true;

    // restart
    game.time.events.add(
        Phaser.Timer.SECOND * 2,
        function() {
            game.state.start( 'play' );
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
      if ( false ) {
        this.game_finished();
        this.message_new( 'Yay!' );
      }
    }
  },

  render: function() {
    //game.debug.body( this.player );
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
  IDLE: function() {
    var idleAnimation = "idle_down";
    var isRunning = false;
    var cursorAngle = 0.0;
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
        var keyboard = input.keyboard;

        cursorAngle = GameInputUtil.getCursorAngle(input);
        // take care of character movement --> enter run state
        if (
          keyboard.isDown(Phaser.KeyCode.W) ||
          keyboard.isDown(Phaser.KeyCode.S) ||
          keyboard.isDown(Phaser.KeyCode.A) ||
          keyboard.isDown(Phaser.KeyCode.D)
        ) {
          isRunning = true;
        }
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
    };
  },
  ROLL: function(moveX, moveY) {
    var speed = 130;
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
        PlayerAnimUtil.updateWeaponHand(player, 0, false);
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
        PlayerAnimUtil.updateWeaponHand(player, 0, false);
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
        return;
      },
      handleInput: function(input) {
        return;
      },
      update: function(player, playerStateMachine) {
        return;
      },
    };
  }
};

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
};

var PlayerAnimUtil = {
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
    if (isVisible) {
      if (MathUtil.isDown(angle)) {
        // noop
      } else if (MathUtil.isRight(angle)) {
        player._weaponHandR.rotation = angle;
        player._weaponHandR.visible = true;
      } else if (MathUtil.isUp(angle)) {
        // noop
      } else {
        player._weaponHandL.rotation = angle;
        player._weaponHandL.visible = true;
      }
    }
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
