/* global game, CocoonJS */

var loadState = {
  init: function () {
    this.input.maxPointers = 1;
    this.scale.pageAlignHorizontally = true;
    Client.setupConnection();
  },

  preload: function () {
    // Add a progress bar
    var progressBar = game.add.sprite( game.world.centerX, game.world.centerY, 'progressBar' );
    progressBar.anchor.setTo( 0.5, 0.5 );
    game.load.setPreloadSprite( progressBar );

    // Load all assets
    this.load.path = 'static/assets/';

    game.load.tilemap( 'map1', 'levels/map.json', null, Phaser.Tilemap.TILED_JSON );

    game.load.image( 'tiles', 'images/tiles.png' );
    game.load.image( 'overlay', 'images/overlay.png' );
    game.load.image( 'font', 'images/font.png' );
    game.load.image( 'share', 'images/share-button.png' );

    game.load.spritesheet( 'confetti', 'images/confetti.png', 2, 2 );
    game.load.spritesheet('slime', 'images/slime.png', 25, 30);
    game.load.spritesheet( 'luciano', 'images/luciano.png', 26, 32, 100, 0, 0 );
    game.load.spritesheet( 'brian', 'images/brian.png', 26, 32, 100, 0, 0 );
    game.load.spritesheet( 'andrew', 'images/andrew.png', 26, 32, 100, 0, 0 );
    game.load.spritesheet( 'tilemap', 'images/tiles.png', 8, 8 );
    
    game.load.image('convict_hand', 'images/convict_hand.png');
    game.load.image('empty_convict_hand', 'images/empty_convict_hand.png');
    game.load.image('empty_convict', 'images/empty_convict.png');
    game.load.image('katana', 'images/katana.png');
    game.load.image('katana_swoosh', 'images/katana_swoosh.png');
    game.load.image('katana_swoosh_flipped', 'images/katana_swoosh_flipped.png');
    game.load.spritesheet('katana_wave', 'images/katana_swoosh_wave.png', 32, 32);
    game.load.image('katana_flipped', 'images/katana_flipped.png');
    game.load.image('katana_swing_r0', 'images/katana_swing_r0.png');
    game.load.image('katana_swing_r0o', 'images/katana_swing_r0o.png');
    game.load.image('katana_swing_r1', 'images/katana_swing_r1.png');
    game.load.image('katana_swing_r1o', 'images/katana_swing_r1o.png');
    game.load.image('heart', 'images/heart.png');
    game.load.image('muzzle_flash_sm', 'images/muzzle_flash_sm.png');
    game.load.image('nailgun', 'images/nailgun.png');
    game.load.image('nailgun_flipped', 'images/nailgun_flipped.png');
    game.load.image('particle', 'images/particle.png');
    game.load.image('particle_sm', 'images/particle_sm.png');
    game.load.spritesheet('particle_sm_impact', 'images/particle_sm_impact.png', 16, 16);
    game.load.image('particle_overlay', 'images/particle_overlay.png');
    game.load.image('particle_overlay_red_lg', 'images/particle_overlay_red_lg.png');
    game.load.image('revolver', 'images/revolver.png');
    game.load.image('revolver_flipped', 'images/revolver_flipped.png');
    game.load.image('uzi', 'images/uzi.png');
    game.load.image('uzi_flipped', 'images/uzi_flipped.png');
  },

  create: function() {
    game.state.start( 'menu' );
  }
};
