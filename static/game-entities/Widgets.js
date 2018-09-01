// UI Widgets.
var FONT_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:?!-_\'#"\\/<>()@';
function PlayerHealthWidget(groupHud, x, y, numHearts) {
  this.hearts = []; // list of heart sprites

  var HEART_SPACING = 2;
  var HEART_WIDTH = 11;
  for (var i = 0; i < numHearts; i++) {
    var heartImage = game.add.image(
      x + i*(HEART_SPACING + HEART_WIDTH),
      y,
      'heart'
    );
    groupHud.add(heartImage);
    this.hearts.push(heartImage);
  }
}
PlayerHealthWidget.prototype = Object.create({});
PlayerHealthWidget.prototype.constructor = PlayerHealthWidget;
PlayerHealthWidget.prototype.displayHealth = function(health) {
  for (var i = 0; i < this.hearts.length; i++) {
    if (i < health) {
      this.hearts[i].visible = true;
    } else {
      this.hearts[i].visible = false;
    }
  }
};

function WeaponWidget(groupHud, x, y, spriteKey) {
  this.WIDTH = 30;
  this.HEIGHT = 20;
  this.overlay = game.add.sprite(x, y, 'overlay');
  this.overlay.alpha = 0.5;
  groupHud.add(this.overlay);
  this.ammoText = game.add.retroFont('font', 4, 6, FONT_SET, 8, 3, 1, 2, 0);
  this.ammoImage = game.add.image(x + this.WIDTH/2, y, this.ammoText);
  this.ammoImage.anchor.setTo(0.5, 0);
  this.ammoText.text = "100";
  groupHud.add(this.ammoImage);
  this.weaponImage = game.add.image(x + this.WIDTH/2, y + 12, spriteKey);
  this.weaponImage.anchor.setTo(0.5, 0.5);
  groupHud.add(this.weaponImage);
}
WeaponWidget.prototype = Object.create({});
WeaponWidget.prototype.constructor = WeaponWidget;
WeaponWidget.prototype.displayAmmo = function(ammo) {
  this.ammoText = ammo.toString();
};
