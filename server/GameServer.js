var fs = require('fs');
var clone = require('clone');
var p2 = require('p2');

var performance = { now: require("performance-now") };

var GameServer = {
  isMapLoaded: false, // whether server loaded the map yet
  lastEntityId: 0, // Id of last entity created
  lastUpdatedTime: performance.now(),
  layers: [], // map layers. each layer is a matrix of Tile objects, ix'd by [row][column]
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

var Tile = require("./Tile");
var World = require("./World");

GameServer.readMap = function() {

  fs.readFile("./static/assets/levels/map.json", function(err, data) {
    if (err) throw err;

    GameServer.map = JSON.parse(data);
    GameServer.objects = {};
    GameServer.layers = [];
    GameServer.tilesets = {};

    GameServer.world = new World(GameServer.map.width * GameServer.map.tilewidth, GameServer.map.height * GameServer.map.tilewidth);

    for (var l = 0; l < GameServer.map.layers.length; l++) {
      var layer = GameServer.map.layers[l];
      if (layer.type == 'objectgroup') {
        GameServer.objects[layer.name] = layer.objects;
      } else if (layer.type == 'tilelayer') {
        // Each layer in GameServer.layers will be a 2D array indexed by [row][column], like a matrix
        var newLayer = [];
        while (layer.data.length) {
          newLayer.push(layer.data.splice(0, layer.width));
        }
        GameServer.layers.push(newLayer);
      }
    }
    for (var t = 0; t < GameServer.map.tilesets.length; t++) {
      var tileset = GameServer.map.tilesets[t];
      GameServer.tilesets[tileset.name] = tileset.tileproperties;
    }

    // iterate over all tiles and work out collisions
    var tileProperties = GameServer.tilesets["tiles"];
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

    console.log(tilesWithCollision);

    // add bodies for tiles with collision to the world
    // now each layer is a 2d array of Tile objects.
    var tileWidth = GameServer.map.tilewidth;
    for (var l = 0; l < GameServer.layers.length; l++) {
      var mainLayer = GameServer.layers[l];
      for (var y = 0; y < mainLayer.length; y++) {
        for (var x = 0; x < mainLayer[0].length; x++) {
          var tileIndex = mainLayer[y][x];
          // only add collision for the layer 0.
          var hasCollision = (tilesWithCollision.includes(tileIndex)) && (l === 0);
          mainLayer[y][x] = new Tile(tileIndex, x, y, tileWidth, hasCollision);
        }
      }
    }
  });

  GameServer.isMapLoaded = true;

  setInterval(GameServer.update, GameServer.UPDATE_RATE);
  // Note: setInterval makes no guarantees about fulfilling the calls. If application code
  // blocks the event loop, the callback will only be fulfilled "as close as possible to the time specified".
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
  player.destroy();
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

  // update entity logic
  Object.keys(GameServer.players).forEach(function(key) {
    var player = GameServer.players[key];
    if (player.isAlive) player.update();
  });

  // clean up entities marked for deletion
  // clean up player bullets
  Object.keys(GameServer.players).forEach(function(key) {
    var player = GameServer.players[key];
    Object.keys(player.bulletMap).forEach(function(localBulletId) {
      var bullet = player.bulletMap[localBulletId];
      if (bullet.willDestroy) {
        bullet.destroy();
        delete player.bulletMap[localBulletId];
      }
    });
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

//================================================
// Respond to client events

var ServerBullet = require("./ServerBullet");

GameServer.handleLocalBulletFired = function(player, data) {
  // create a server bullet to simulate locally and also
  // create a ServerBulletFired event to relay
  if (player) {
    player.applyLocalBulletFiredEvent(data);
    //GameServer.world.debugBodies();
    var serverBulletFiredEvent = player.lastBulletFiredEvent;
    return serverBulletFiredEvent;
  }
  return null;
};

//======================================================
// Client initialization stuff

GameServer.createInitializationPacket = function(playerId) {
  return {
    id: playerId,
  };
};

GameServer.determineStartingPosition = function() {
  return {
    x: 50,
    y: 282,
  };
};
