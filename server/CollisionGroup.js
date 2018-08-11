// Collision Groups

// groups are created as bitmasks, e.g. Math.pow(2, 1) --> 00000010
exports.TILES = Math.pow(2, 0);
exports.OBJECTS = Math.pow(2, 1);
exports.ACTORS = Math.pow(2, 2);
exports.BULLETS = Math.pow(2, 3);

// a group that collides with everything
exports.ALL = -1;
