var Body = require("./Body");
var Group = require("./CollisionGroup");
var GameServer = require("./GameServer");

// A tile with collision.
function Tile(tileIndex, x, y, tileWidth, hasCollision = false) {
  this.index = tileIndex;

  // (x, y) is the location of the tile in tile coordinates.
  this.x = x;
  this.y = y;
  if (hasCollision) {
    this.body = new Body(this, x * tileWidth + tileWidth/2.0, y * tileWidth + tileWidth/2.0, 0);
    var colGroup = Group.TILES;
    var colMask = Group.ACTORS | Group.BULLETS;
    this.body.addBox(tileWidth, tileWidth, colGroup, colMask, 0, 0);
    GameServer.world.addBody(this.body);
  }
}

Tile.prototype.destroy = function() {
  if (this.body) GameServer.world.removeBody(this.body);
};

Tile.prototype.collideWith = function(entity) {
  // override
  return;
};

Tile.prototype.toString = function() {
  return `[${this.constructor.name}::(${this.x}, ${this.y}) index:${this.index}]`;
};

module.exports = Tile;
