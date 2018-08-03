var p2 = require("p2");

// util functions
function pxToP2(px) {
  // convert pixels to p2 units
  return px * -0.05;
}

function p2ToPx(p2Units) {
  return p2Units * -20;
}

function Body(x, y) {
  p2.Body.call(this, {
    mass: 1,
    position: [x, y]
  });
}

Body.prototype = Object.create(p2.Body.prototype);
Object.defineProperty(Body.prototype, "x", {
  get: function() {
    return p2ToPx(this.position[0]);
  },
  set: function(value) {
    this.position[0] = pxToP2(value);
  },
});
Object.defineProperty(Body.prototype, "y", {
  get: function() {
    return p2ToPx(this.position[1]);
  },
  set: function(value) {
    this.position[1] = pxToP2(value);
  },
});

module.exports = Body;
