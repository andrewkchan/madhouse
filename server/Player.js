var p2 = require("p2");

var MovingEntity = require("./MovingEntity");
var GameServer = require("./GameServer");
var Group = require("./CollisionGroup");
var ServerBullet = require("./ServerBullet");
var ServerBulletEvents = require("./ServerBulletEvents");
var util = require("./util");


function Player(name, socketId) {
  MovingEntity.call(this);
  this.name = name;
  this.isAlive = true;
  var startingPosition = GameServer.determineStartingPosition();

  this.bulletMap = {};

  // configure collision of body, etc.
  // Note: p2 shapes are offset relative to center of mass.
  // OTOH phaser sprite x,y are the top-left corner.
  var bodyRect = new p2.Box({
    width: util.pxToP2(8),
    height: util.pxToP2(12),
  });
  bodyRect.collisionMask = Group.ACTORS | Group.BULLETS | Group.TILES | Group.OBJECTS;
  bodyRect.collisionGroup = Group.ACTORS;
  this.body.addShape(bodyRect);

  this.body.x = startingPosition.x;
  this.body.y = startingPosition.y;
  this.currentStateName = "IDLE";
  this.cursorAngle = 0;
  this.weaponName = "DefaultWeapon";

  this.lastBulletFiredEvent = null;

  this.socketId = socketId; // note socketId != entity id
}

Player.prototype = Object.create(MovingEntity.prototype);
Player.prototype.constructor = Player;

module.exports = Player;

Player.prototype.getSnapshot = function() {
  // Trim player object to send to client
  return {
    id: this.id,
    name: this.name,
    x: this.body.x,
    y: this.body.y,
    velocity: {
      x: this.body.velocity[0],
      y: this.body.velocity[1],
    },
    currentStateName: this.currentStateName,
    cursorAngle: this.cursorAngle,
    weaponName: this.weaponName,
  };
};

Player.prototype.syncWithSnapshot = function(snapshot) {
  // sync to a client snapshot.
  this.body.x = snapshot.x;
  this.body.y = snapshot.y;
  this.body.velocity[0] = snapshot.velocity.x;
  this.body.velocity[1] = snapshot.velocity.y;

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
