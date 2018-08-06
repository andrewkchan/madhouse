function ClientSnapshot() {
  this.player = null; // own player snapshot
  // entities besides player that client has authority over.
  this.bullets = {};

}

ClientSnapshot.prototype.setPlayerSnapshot = function(playerSnapshot) {
  this.player = playerSnapshot;
};

ClientSnapshot.prototype.addBulletSnapshot = function(bulletSnapshot) {
  var uniqueId = `${bulletSnapshot.shooterId}:${bulletSnapshot.localBulletId}`;
  this.bullets[uniqueId] = bulletSnapshot;
};
