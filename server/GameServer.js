var fs = require('fs');
var clone = require('clone');
var p2 = require('p2');

var performance = { now: require("performance-now") };

var GameServer = {
  isMapLoaded: false, // whether server loaded the map yet
  lastEntityId: 0, // Id of last entity created
  lastUpdatedTime: performance.now(),
  layers: [], // map layers
  map: null, // object containing world map data
  numConnectedChanged: false,
  objects: {}, // GameObjects from map
  players: {}, // map of all connected players by Id
  server: null,
  socketMap: {}, // map of socket Ids to player Ids of connected players
  tilesets: {}, // map tilesets
  // frequency of the server update loop ; rate at which the player and monsters objects will call their "update" methods
  // This is NOT the rate at which updates are sent to clients (see server.clientUpdateRate)
  UPDATE_RATE: 1000.0/60.0,
  UPDATE_TIMESTEP: 1/60.0,

  world: null, // physics simulation world
};

module.exports = GameServer;

var Player = require('./Player');


GameServer.addPlayerId = function(socketId, playerId) {
  GameServer.socketMap[socketId] = playerId;
};

GameServer.getPlayerIdBySocketId = function(socketId) {
  return GameServer.socketMap[socketId];
};

GameServer.getPlayerBySocketId = function(socketId) {
  return GameServer.players[GameServer.getPlayerIdBySocketId(socketId)];
};

GameServer.deleteSocketId = function(socketId) {
  delete GameServer.socketMap[socketId];
};

//==============================================
// Read map and set up world

GameServer.readMap = function() {
  // TODO
  GameServer.world = (function() {
    var world = new p2.World();
    // turn off things we aren't using
    world.defaultContactMaterial.friction = 0;
    world.applyGravity = false;
    world.applySpringForces = false;
    world.emitImpactEvent = false;
    return world;
  })();
  GameServer.isMapLoaded = true;
  return;
};

GameServer.setUpEntities = function() {
  // TODO
  return;
};

//================================================
// Managing the player

GameServer.isSocketIdFree = function(id) {
  // Check that no player is using the given socket id
  return (GameServer.getPlayerIdBySocketId(id) === undefined);
};

GameServer.isPlayerIdFree = function(id) {
  // Check that no other player is using the given id
  return (GameServer.players[id] === undefined);
};

GameServer.addNewPlayer = function(socket, data) {
  var player = new Player("new player", socket.id);
  GameServer.world.addBody(player.body);
  GameServer.addPlayerId(socket.id, player.id);
  // add player to all relevant data structures
  GameServer.players[player.id] = player;
  GameServer.numConnectedChanged = true;

  console.log("Added new player with id " + player.id);

  GameServer.server.sendInitializationPacket(
    socket,
    GameServer.createInitializationPacket(player.id)
  );
};

GameServer.removePlayerBySocketId = function(socketId) {
  var player = GameServer.getPlayerBySocketId(socketId);
  //player.setProperty("connected", false);
  player.isAlive = false;
  GameServer.world.removeBody(player.body);
  delete GameServer.players[player.id];
  GameServer.numConnectedChanged = true;
  GameServer.deleteSocketId(socketId);
};

//=========================================
// Update Game objects

GameServer.update = function() {
  // update physics
  var now = performance.now();
  var deltaTime = (now - GameServer.lastUpdatedTime) / 1000.0;
  GameServer.world.step(GameServer.UPDATE_TIMESTEP, deltaTime, 10);
  GameServer.lastUpdatedTime = now;

  Object.keys(GameServer.players).forEach(function(key) {
    var player = GameServer.players[key];
    if (player.isAlive) player.update();
  });
};

GameServer.updateClients = function() {
  var snapshot = GameServer.getSnapshot();
  Object.keys(GameServer.players).forEach(function(key) {
    var player = GameServer.players[key];
    var updatePkg = clone(snapshot);
    if (updatePkg.players[player.id]) delete updatePkg.players[player.id]; //remove echo
    GameServer.server.sendUpdate(player.socketId, updatePkg);
  });
};

GameServer.getSnapshot = function() {
  // Get a snapshot of server state to send to clients.
  var snapshot = {
    players: {},
  };
  Object.keys(GameServer.players).forEach(function(key) {
    snapshot.players[key] = GameServer.players[key].getSnapshot();
  });
  return snapshot;
};

GameServer.processClientSnapshot = function(socketId, snapshot) {
  var player = GameServer.getPlayerBySocketId(socketId);
  if (player) player.syncWithSnapshot(snapshot);
};

//======================================================
// Client initialization stuff

GameServer.createInitializationPacket = function(playerId) {
  return {};
};

GameServer.determineStartingPosition = function() {
  return {
    x: 50,
    y: 282,
  };
};
