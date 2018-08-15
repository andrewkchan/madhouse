var Client = {
  INIT_EVENT_NAME: "init",

  // used to sync clocks before syncing game state
  clientServerClockDeltas: [],
  lastSentTime: undefined,
  medianClockDelta: 0,
  clockSamples: 0,
  clockSyncFinished: false,
};
Client.socket = io.connect();
Client.correctPacketStamp = function(packet) {
  // correct a server timestamp to sync the stamped time with the client clock.
  if ("stamp" in packet) {
    packet.stamp += Client.medianClockDelta;
    return packet;
  } else {
    throw new Error("Packet is missing server timestamp");
  }
};

/*
The Client object is responsible for first setting up a connection and then transmitting and receiving
packets used to synchronize game state over that connection. The flow is as follows:

1. User opens browser window.
2. Client.setupConnection: Synchronize client and server clocks.
3. Client.askNewPlayer: Ask the server for an init packet for the new player.
4. Game state is initialized and begins to synchronize.

Reference: http://www.mine-control.com/zack/timesync/timesync.html
*/
Client.askNewPlayer = function() {
  Client.socket.emit("ask-init");
};
Client.setupConnection = function() {
  Client.lastSentTime = +Date.now();
  Client.socket.emit("clock-pinq", Client.lastSentTime);
};
Client.socket.on("clock-ponq", function(serverStamp) {
  var latency = +Date.now() - Client.lastSentTime;
  var clientServerClockDelta = (serverStamp - Client.lastSentTime) - latency/2;
  Client.clientServerClockDeltas.push([clientServerClockDelta]);

  Client.clockSamples++;
  if (Client.clockSamples < 15) {
    Client.lastSentTime = +Date.now();
    Client.socket.emit("clock-pinq", Client.lastSentTime);
  } else if (!Client.clockSyncFinished) {
    // compute the median client-server clock delta
    Client.medianClockDelta = quickMedian(Client.clientServerClockDeltas);

    Client.clockSyncFinished = true;
    console.log(`Clock sync finished with median clock delta ${Client.medianClockDelta}`);
    Client.askNewPlayer();
  }
});

Client.socket.on(Client.INIT_EVENT_NAME, function(data) {
  // This event triggers when receiving the initialization packet from the server, to use in playState.initWorld()
  Client.socket.emit('ponq', data.stamp); // send back a pong stamp to compute latency
  data = Client.correctPacketStamp(data);
  playState.initOwnPlayer(data);
  playState.beginSync();
});

Client.socket.on("update", function(data) {
  data = Client.correctPacketStamp(data);
  playState.processServerUpdate(data);
});

Client.socket.on("remove", function(data) {
  var id = data;
  playState.removePlayer(id);
});

//==================
// server event

Client.socket.on("entityTookDamage", function(data) {
  playState.onEntityTookDamage(data);
});
Client.socket.on("playerRespawned", function(data) {
  playState.onPlayerRespawned(data);
});
Client.socket.on("serverBulletFired", function(data) {
  playState.onServerBulletFired(data);
});
Client.socket.on("serverBulletDestroyed", function(data) {
  playState.onServerBulletDestroyed(data);
});

//==================
// Client obj utils
function quickMedian(arr) {
  var  l = arr.length;
  var n = (l%2 == 0 ? (l/2)-1 : (l-1)/2);
  quickselect(arr, n);
  return arr[n];
};

function quickselect(arr, k, left, right, compare) {
  quickselectStep(arr, k, left || 0, right || (arr.length - 1), compare || defaultCompare);
}

function quickselectStep(arr, k, left, right, compare) {
  while (right > left) {
    if (right - left > 600) {
      var n = right - left + 1;
      var m = k - left + 1;
      var z = Math.log(n);
      var s = 0.5 * Math.exp(2 * z / 3);
      var sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
      var newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
      var newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
      quickselectStep(arr, k, newLeft, newRight, compare);
    }

    var t = arr[k];
    var i = left;
    var j = right;

    swap(arr, left, k);
    if (compare(arr[right], t) > 0) swap(arr, left, right);

    while (i < j) {
      swap(arr, i, j);
      i++;
      j--;
      while (compare(arr[i], t) < 0) i++;
      while (compare(arr[j], t) > 0) j--;
    }

    if (compare(arr[left], t) === 0) swap(arr, left, j);
    else {
      j++;
      swap(arr, j, right);
    }

    if (j <= k) left = j + 1;
    if (k <= j) right = j - 1;
  }
}

function swap(arr, i, j) {
  var tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}

function defaultCompare(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}
