/* global game, Phaser */

var playState = {
  enableOptimisticProjectileCollisions: true,
  interpolationLag: 2, // networked entities are rendered this many frames in the past to make them smooth.
  playerMap: {},
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


  addNewPlayer: function(id, playerSnapshot) {
    console.log(`Added new player ${id} at position ${playerSnapshot.x}, ${playerSnapshot.y}`);
    var player = new Player(id);
    this.playerMap[id] = player;
    player.x = playerSnapshot.x;
    player.y = playerSnapshot.y;
    player.body.velocity.x = playerSnapshot.velocity.x;
    player.body.velocity.y = playerSnapshot.velocity.y;
    this.actorGroup.add(player);
  },

  removePlayer: function(id) {
    this.actorGroup.remove(this.playerMap[id], destroy=true);
    delete this.playerMap[id];
  },

  /**
   * Create game world
   */
  create: function () {
    // Register NavMesh plugin with Phaser
    this.navMeshPlugin = this.game.plugins.add(Phaser2NavMeshPlugin);

    // add object groups - used for looping through objects and for setting z-order
    this.groupLevel = this.add.group();
    this.groupDrinks = this.add.group();
    this.groupKeys = this.add.group();
    this.groupDoors = this.add.group();
    this.groupScrolls = this.add.group();
    this.groupMilk = this.add.group();
    this.actorGroup = this.add.group();
    this.groupHud = this.add.group();

    // fix hud to camera
    this.groupHud.fixedToCamera = true;

    // setup arcade physics
    game.physics.startSystem( Phaser.Physics.ARCADE );
    game.physics.arcade.TILE_BIAS = 8;

    // cursor controls
    game.input.mouse.capture = true;

    //createEnemies
    this.createEnemies();

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

    this.health_overlay = this.game.add.sprite(this.width - 21, this.height + 64 - 7, 'overlay');
    this.health_overlay.alpha = 0.8;
    this.health_overlay.anchor.setTo(0, 1);
    this.groupHud.add(this.health_overlay);
    this.health_text = this.game.add.retroFont('font', 4, 6, this.font_set, 8, 3, 1, 2, 0);
    this.health_image = this.game.add.image(this.width, this.height - 7, this.health_text);
    this.health_image.anchor.setTo(1, 0);
    this.health_text.text = "100";
    this.groupHud.add(this.health_image);

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
    this.player_speed = 90;
    this.milk_required = 0;
    this.milk_found = 0;
    this.game_over = false;
    this.display_scroll = false;

    // load level
    this.load_map();
  },

  createEnemies: function() {
    //var slime = new Slime(this.ownPlayer);
    //this.actorGroup.add(slime);
  },

  init: function(data) {
    // If the game loads while the window is out of focus, it may hang; disableVisibilityChange should be set to true
    // only once it's fully loaded
    if (document.hasFocus()) {
        game.stage.disableVisibilityChange = true; // Stay alive even if window loses focus
    } else {
        game.onResume.addOnce(function() {
            game.stage.disableVisibilityChange = true;
        }, this);
    }
    Client.setupConnection();
    this.message_new("Setting up connection...");
  },

  /**
   * Update game
   */
  update: function() {
    if (!this.ownPlayer) return;

    this.ownPlayer.handleInput(game.input);

    // Compute render timestamp for interpolated entities.
    var renderTimestamp = +Date.now() - this.interpolationLag*(1000.0/20);

    for (var playerId in this.playerMap) {
      if (playerId !== this.ownPlayer.id) {
        this.playerMap[playerId].interpolate(renderTimestamp);
      }
    }

    game.physics.arcade.collide(this.actorGroup, this.layer);
    game.physics.arcade.collide(this.ownPlayer, this.groupDoors);

    game.physics.arcade.collide(
      this.ownPlayer,
      this.actorGroup,
      this.onPlayerEntityCollision,
      null,
      this
    );

    if (this.enableOptimisticProjectileCollisions) {
      // if optimistic projectile collisions are enabled, don't wait for a server response
      // to confirm that our own projectiles collided with something - simulate the collision ourselves.
      game.physics.arcade.collide(
        this.ownPlayer._weapon.bullets,
        this.layer,
        this.onBulletCollision,
        null,
        this
      );
      game.physics.arcade.overlap(
        this.ownPlayer._weapon.bullets,
        this.actorGroup,
        this.onBulletCollision,
        null,
        this
      );
    }

    game.physics.arcade.overlap( this.ownPlayer, this.groupKeys, this.key_take, null, this );
    game.physics.arcade.overlap( this.ownPlayer, this.groupMilk, this.milk_take, null, this );
    game.physics.arcade.overlap( this.ownPlayer, this.groupDrinks, this.drink_take, null, this );
    game.physics.arcade.overlap( this.ownPlayer, this.groupScrolls, this.scroll_display, null, this );

    this.scroll_update();
    this.timer_update();
    this.game_update();

    this.health_text.text = String(this.ownPlayer.health);
  },

  //========================================================
  // Client-server sync stuff

  // buffer to hold time-sensitive events from the server.
  // previous events are used to smoothly interpolate game state in the past.
  remoteEvents: [],

  beginSync: function() {
    var updatesPerSecond = 20; // number of updates to send to server per second
    setInterval(this.emitPlayerSnapshot.bind(this), 1000 / updatesPerSecond);
  },

  emitPlayerSnapshot: function() {
    // emit a snapshot of client's own player to the server.
    // this should be called at a regular interval.
    Client.socket.emit("snapshot", this.ownPlayer.getSnapshot());
  },

  initOwnPlayer: function(data) {
    console.log(`Init own player with id ${data.id}`);
    this.ownPlayer = new Player(data.id, true);
    this.ownPlayer.addInputEvents();
    this.actorGroup.add( this.ownPlayer );
     // position player
    var player_position = this.findObjectsByType( 'start', this.map, 'objects' );
    if ( player_position[0] ) {
      // use the first result - there should only be 1 start point per level
      // if there isn't we'll just ignore the others
      this.ownPlayer.x = player_position[0].x + ( this.tile_size / 2 );
      this.ownPlayer.y = player_position[0].y + 2;
      this.camera.x = Math.floor( this.ownPlayer.x / this.width );
      this.camera.y = Math.floor( this.ownPlayer.y / this.height );
      // position camera
      game.camera.follow(this.ownPlayer);
      game.camera.bounds = null;
    }
  },

  onEntityTookDamage: function(data) {
    if (data.entityId in this.playerMap) {
      // entity is a player
      this.playerMap[data.entityId].takeDamage(data.dmg);
    } else if (data.entityId === this.ownPlayer.id) {
      this.ownPlayer.takeDamage(data.dmg);
    }
  },

  onPlayerRespawned: function(data) {
    if (data.playerId === this.ownPlayer.id) {
      this.ownPlayer.reset(data.x, data.y, data.health);
    } else {
      this.playerMap[data.playerId].reset(data.x, data.y, data.health);
    }
    console.log(`Respawn player ${data.playerId} at (${data.x}, ${data.y})`);
  },

  onServerBulletFired: function(data) {
    var shooter = this.playerMap[data.shooterId];
    if (shooter) {
      shooter.applyServerBulletFiredEvent(data);
    }
  },

  onServerBulletDestroyed: function(data) {
    var shooter = this.playerMap[data.shooterId];
    if (this.ownPlayer && data.shooterId === this.ownPlayer.id) shooter = this.ownPlayer;
    if (shooter) {
      shooter.applyServerBulletDestroyedEvent(data);
    }
  },

  processServerUpdate: function(updatePacket) {
    var self = this;
    var updatePlayerIds = Object.keys(updatePacket.players);
    updatePlayerIds.forEach(function(id) {
      var playerPacket = updatePacket.players[id];
      playerPacket.stamp = updatePacket.stamp; // add timestamp to each individual snapshot
      if (!(id in self.playerMap)) {
        self.addNewPlayer(id, playerPacket);
      } else {
        self.playerMap[id].pushSnapshot(playerPacket);
      }
    });
    // remove any disconnected players
    if (updatePlayerIds.length < Object.keys(this.playerMap).length) {
      var playerIdsToDelete = Object.keys(this.playerMap).filter(function(playerId) {
        return !(playerId in updatePacket.players);
      });
      playerIdsToDelete.forEach(function(playerId) {
        self.removePlayer(playerId);
      });
    }
  },

  //===========================================================

  onBulletCollision: function(bullet, entity) {
    if (entity instanceof Actor) {
      bullet.collideWith(entity);
    }
    bullet.impact();
  },


  onPlayerEntityCollision: function(player, entity) {
    if (entity instanceof Actor && entity.name !== "player") {
      entity.collideWith(player);
    }
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
    this.map.addTilesetImage('tiles');

    // -- NavMesh Setup --

    // Load the navMesh from the tilemap object layer "navmesh". The navMesh was created with
    // 8 pixels of space around obstacles.
    this.navMesh = this.navMeshPlugin.buildMeshFromTiled(
      "mesh1",
      this.map.objects["navmesh"],
      8
    );
    var navMeshDebugGraphics = game.add.graphics(0, 0);
    navMeshDebugGraphics.alpha = 0.5;
    this.navMesh.enableDebug(navMeshDebugGraphics);

    var tileProperties = this.map.tilesets[0].tileProperties;
    var tilesWithCollision =
      Object
        .keys(tileProperties)
        .filter(function(index) {
          return tileProperties[index].hasCollision;
        })
        .map(function(index) {
          return Number(index) + 1;
        });
    var tilesWithFalling =
      Object
        .keys(tileProperties)
        .filter(function(index) {
          return tileProperties[index].canFall;
        })
        .map(function(index) {
          return Number(index) + 1;
        });

    this.map.setCollision(tilesWithCollision);
    // water collision detection
    this.map.setTileIndexCallback(
      tilesWithFalling,
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

    // position slime and config with navmesh
    var slimePosition = this.findObjectsByType('slime', this.map, 'objects');
    if (slimePosition[0]) {
      var slime = this.actorGroup.getByName('slime');
      if (slime) {
        slime.x = slimePosition[0].x;
        slime.y = slimePosition[0].y;
        slime.navMesh = this.navMesh;
        this.slime = slime;
      }
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
    this.actorGroup.add( emitter );

    emitter.start( false, 1500, 70 );
  },

  fall_in_pit: function(sprite, tile) {
    if (tile.containsPoint(sprite.body.center.x, sprite.body.center.y)) {
      if (sprite === this.ownPlayer) {
        var currentState = this.ownPlayer.playerStateMachine.peekState();
        if (currentState.name !== "FALL" && currentState.name !== "ROLL") {
          var fallToDeathState =
            PlayerStateFactory.FALL(function() {
              this.game_lost();
            }, this);
          this.ownPlayer.playerStateMachine.popState();
          this.ownPlayer.playerStateMachine.pushState(fallToDeathState);
        }
      }
    }
  },

  /**
   * Game completed. Now we can stop the timer and let the user wander around the world
   */
  game_finished: function() {
    this.timer.pause();
    this.door_open( { key_id: 7 } );
  },

  /**
   * Game over - have to try again
   */
  game_lost: function() {
    // this.overlay_new( 'You lost :(', 1000, 1 );
    //
    // this.game_over = true;
    //
    // // restart
    // game.time.events.add(
    //     Phaser.Timer.SECOND * 2,
    //     function() {
    //         game.state.start( 'play' );
    //     },
    //     this
    // );
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
    // this.ownPlayer._weapon.debug(0, 0, true);
    // game.debug.body( this.ownPlayer );
    // game.debug.body(this.slime);
    // this.navMesh.debugDrawClear();
    // this.navMesh.debugDrawMesh({
    //   drawCentroid: true,
    //   drawBounds: false,
    //   drawNeighbors: false,
    //   drawPortals: true
    // });
  }
};
