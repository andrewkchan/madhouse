var p2 = require("p2");
var util = require("./util");

function Body(x, y, mass = 1) {
  p2.Body.call(this, {
    mass: mass,
    position: [x, y]
  });
}

Body.prototype = Object.create(p2.Body.prototype);
Object.defineProperty(Body.prototype, "x", {
  get: function() {
    return util.p2ToPx(this.position[0]);
  },
  set: function(value) {
    this.position[0] = util.pxToP2(value);
  },
});
Object.defineProperty(Body.prototype, "y", {
  get: function() {
    return util.p2ToPx(this.position[1]);
  },
  set: function(value) {
    this.position[1] = util.pxToP2(value);
  },
});

module.exports = Body;
