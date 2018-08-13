var p2 = require("p2");

var MovingEntity = require("./MovingEntity");
var GameServer = require("./GameServer");
var Group = require("./CollisionGroup");
var ServerBullet = require("./ServerBullet");
var ServerBulletEvents = require("./ServerBulletEvents");
var EntityEvents = require("./EntityEvents");
var util = require("./util");


function Player(name, socketId) {
  MovingEntity.call(this);
  this.name = name;
  this.isAlive = true;
  var startingPosition = GameServer.determineStartingPosition();

  this.health = 6;
  this.maxHealth = 6;

  this.bulletMap = {};

  // configure collision of body, etc.
  var colGroup = Group.ACTORS;
  var colMask = Group.ACTORS | Group.BULLETS | Group.TILES | Group.OBJECTS;
  this.body.addBox(8, 12, colGroup, colMask, 8/2, 12/2); // TODO figure out correct offset

  this.body.x = startingPosition.x;
  this.body.y = startingPosition.y;
  this.currentStateName = "IDLE";
  this.cursorAngle = 0;

  // character-specific things
  this.weaponName = "DefaultWeapon";

  this.lastBulletFiredEvent = null;
  this.lastSpawnEvent = new EntityEvents.PlayerRespawnedEvent(this.id, this.body.x, this.body.y, this.maxHealth);
  // pre-allocate a snapshot
  this.snapshot = new PlayerSnapshot(this);

  this.socketId = socketId; // note socketId != entity id
}

Player.prototype = Object.create(MovingEntity.prototype);
Player.prototype.constructor = Player;

module.exports = Player;

function PlayerSnapshot(player) {
  this.id = player.id;
  this.name = player.name;
  this.x = player.x;
  this.y = player.y;
  this.velocity = {
    x: player.body.velocity.x,
    y: player.body.velocity.y,
  };
  this.currentStateName = player.currentStateName;
  this.cursorAngle = player.cursorAngle;
  this.weaponName = player.weaponName;
  this.health = player.health;
  this.isAlive = player.isAlive;
}
Player.prototype.getSnapshot = function() {
  // Trim player object to send to client
  var snapshot = this.snapshot;
  snapshot.x = this.body.x;
  snapshot.y = this.body.y;
  snapshot.velocity.x = this.body.velocity.x;
  snapshot.velocity.y = this.body.velocity.y;
  snapshot.currentStateName = this.currentStateName;
  snapshot.cursorAngle = this.cursorAngle;
  snapshot.weaponName = this.weaponName;
  snapshot.health = this.health;
  snapshot.isAlive = this.isAlive;
  return this.snapshot;
};

Player.prototype.syncWithSnapshot = function(snapshot) {
  // sync to a client snapshot.
  this.body.x = snapshot.x;
  this.body.y = snapshot.y;
  this.body.velocity.x = snapshot.velocity.x;
  this.body.velocity.y = snapshot.velocity.y;

  this.currentStateName = snapshot.currentStateName;
  this.cursorAngle = snapshot.cursorAngle;
  this.weaponName = snapshot.weaponName;
};

Player.prototype.applyLocalBulletFiredEvent = function(data) {
  var bullet = ServerBullet.fromLocalBulletFiredEvent(this.id, data);
  this.bulletMap[data.localBulletId] = bullet;
  if (this.lastBulletFiredEvent == null) {
    this.lastBulletFiredEvent = new ServerBulletEvents.ServerBulletFiredEvent(
      data.x,
      data.y,
      data.velocity.x,
      data.velocity.y,
      data.localBulletId,
      this.id,
    );
  }
  this.lastBulletFiredEvent.syncWithBullet(bullet);
};

// receive an EntityTookDamageEvent and modify it as necessary.
// returns null (if take no damage) or a modified event.
Player.prototype.takeDamage = function(entityTookDamageEvent) {
  if (this.health <= 0 || this.currentStateName === "ROLL") {
    entityTookDamageEvent.returnToPool();
    return null;
  }
  this.health = Math.max(0, this.health - entityTookDamageEvent.dmg);
  this.isAlive = this.health > 0;
  return entityTookDamageEvent;
};
Player.prototype.respawnAt = function(x, y) {
  this.health = this.maxHealth;
  this.isAlive = true;
  this.body.x = x;
  this.body.y = y;
  this.currentStateName = "IDLE";

  this.lastSpawnEvent.x = x;
  this.lastSpawnEvent.y = y;
  this.lastSpawnEvent.health = this.health;
  return this.lastSpawnEvent;
};
