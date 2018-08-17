/* global Phaser, game */

var menuState = {
  font_set: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:?!-_\'#"\\/<>()@',

  create: function() {
    this.message = this.game.add.retroFont( 'font', 4, 6, this.font_set, 8, 3, 1, 2, 1 );
    this.message.autoUpperCase = false;
    this.message.text = "Select your character";
    this.message_image = this.game.add.image( game.width / 2, game.height - 10, this.message );
    this.message_image.anchor.setTo( 0.5, 0.5 );

    this.andrew = new Player(null, false, "andrew", DualUziManager);
    this.andrew.x = 64;
    this.andrew.y = 50;
    this.andrew.inputEnabled = true;
    this.andrew.events.onInputDown.add(function() { this.start(this.andrew); }, this);
    this.luciano = new Player(null, false, "luciano", RevolverManager);
    this.luciano.x = 128;
    this.luciano.y = 50;
    this.luciano.inputEnabled = true;
    this.luciano.events.onInputDown.add(function() { this.start(this.luciano); }, this);
    this.brian = new Player(null, false, "brian", NailgunManager);
    this.brian.x = 192;
    this.brian.y = 50;
    this.brian.inputEnabled = true;
    this.brian.events.onInputDown.add(function() { this.start(this.brian); }, this);
  },

  start: function(sprite) {
    var characterName = sprite.animSet;
    this.andrew.destroy();
    this.luciano.destroy();
    this.brian.destroy();
    game.state.start('play', true, false, characterName);
  },

  updateAlpha: function(sprite) {
    if (sprite.input.pointerOver()) {
      sprite.alpha = 1;
    } else {
      sprite.alpha = 0.5;
    }
  },

  update: function() {
    this.updateAlpha(this.andrew);
    this.updateAlpha(this.brian);
    this.updateAlpha(this.luciano);
  },
};
