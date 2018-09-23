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
  this.pie = new PieProgress(game, game.width/2, game.height/2 - 15, 5);
  groupHud.add(this.pie);
}
WeaponWidget.prototype = Object.create({});
WeaponWidget.prototype.constructor = WeaponWidget;
WeaponWidget.prototype.displayAmmo = function(clipAmmo, reserveAmmo) {
  this.ammoText.text = `${clipAmmo}/${reserveAmmo}`;
};
WeaponWidget.prototype.displayReloadProgress = function(progress) {
  if (progress === 0.0) {
    this.pie.visible = false;
  } else {
    this.pie.visible = true;
    this.pie.progress = progress;
  }
};


function PieProgress(game, x, y, radius, color, angle, weight) {
  this._radius = radius;
  this._progress = 0.0;
  this._weight = weight || 0.5;
  this._color = color || "#fff";
  this.bmp = game.add.bitmapData(
    (this._radius * 2) + (this._weight * this._radius * 0.6),
    (this._radius * 2) + (this._weight * this._radius * 0.6),
  );
  Phaser.Sprite.call(this, game, x, y, this.bmp);

  this.anchor.set(0.5);
  this.angle = angle || -90.0;
  this.updateProgress();
}
PieProgress.prototype = Object.create(Phaser.Sprite.prototype);
PieProgress.prototype.constructor = PieProgress;
PieProgress.prototype.updateProgress = function() {
  var progress = this._progress;
  progress = Phaser.Math.clamp(progress, 0.00001, 0.99999);
  this.bmp.clear();
  this.bmp.ctx.imageSmoothingEnabled = false;
  this.bmp.ctx.mozImageSmoothingEnabled = false;
  this.bmp.ctx.webkitImageSmoothingEnabled = false;
  this.bmp.ctx.strokeStyle = this._color;
  this.bmp.ctx.lineWidth = 2; //this._weight * this._radius;
  this.bmp.ctx.beginPath();
  this.bmp.ctx.arc(
    this.bmp.width * 0.5,
    this.bmp.height * 0.5,
    this._radius, 0,
    (Math.PI * 2)*progress, false
  );
  this.bmp.ctx.stroke();
  this.bmp.dirty = true;
};
PieProgress.prototype.updateBmpSize = function() {
  this.bmp.resize(
    (this._radius * 2) + (this._weight * this._radius * 0.75),
    (this._radius * 2) + (this._weight * this._radius * 0.75),
  );
}
Object.defineProperty(PieProgress.prototype, 'color', {
  get: function() {
    return this._color;
  },
  set: function(val) {
    this._color = val;
    this.updateProgress();
  }
});
Object.defineProperty(PieProgress.prototype, 'radius', {
  get: function() {
    return this._radius;
  },
  set: function(val) {
    this._radius = (val > 0 ? val : 0);
    this.updateBmpSize();
    this.updateProgress();
  }
});
Object.defineProperty(PieProgress.prototype, 'progress', {
  get: function() {
    return this._progress;
  },
  set: function(val) {
    this._progress = Phaser.Math.clamp(val, 0, 1);
    this.updateProgress();
  }
});
Object.defineProperty(PieProgress.prototype, 'weight', {
  get: function() {
    return this._weight;
  },
  set: function(val) {
    this._weight = Phaser.Math.clamp(val, 0.01, 0.99);
    this.updateBmpSize();
    this.updateProgress();
  }
});
