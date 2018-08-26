var p2 = require("p2");
var util = require("./util");

function Body(parentEntity, x, y, mass = 1) {
  // if mass == 0, the body type is STATIC, e.g. it does not move.
  p2.Body.call(this, {
    mass: mass,
    position: [util.pxToP2(x), util.pxToP2(y)]
  });

  this.entity = parentEntity; // parent MovingEntity object

  this.velocity = (function(p2Velocity) {
    var proxy = p2Velocity;
    Object.defineProperty(proxy, "x", {
      get: function() {
        return util.p2ToPx(p2Velocity[0]);
      },
      set: function(value) {
        p2Velocity[0] = util.pxToP2(value);
      },
    });
    Object.defineProperty(proxy, "y", {
      get: function() {
        return util.p2ToPx(p2Velocity[1]);
      },
      set: function(value) {
        p2Velocity[1] = util.pxToP2(value);
      },
    });
    return proxy;
  })(this.velocity);
}

Body.prototype = Object.create(p2.Body.prototype);
Body.prototype.constructor = Body;
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

Body.prototype.addBox = function(
  width, // in px
  height, // in px
  collisionGroup,
  collisionMask,
  offsetX = 0, // in px
  offsetY = 0, // in px
) {
  var bodyRect = new p2.Box({
    width: util.pxToP2(width),
    height: util.pxToP2(height),
  });
  bodyRect.collisionMask = collisionMask;
  bodyRect.collisionGroup = collisionGroup;
  // Note: p2 shapes are offset relative to center of mass.
  // OTOH phaser sprite x,y are the top-left corner.
  this.addShape(bodyRect, [util.pxToP2(offsetX), util.pxToP2(offsetY)]);
};
// add an equilateral triangle wih top vertex at the given offset with given width and bisecting line at the given angle.
// For example, if the angle is -PI radians and the offset is 0,0, the triangle will have top vertex at the body's position
// and the rest of the triangle will be below the vertex, centered around the y-axis.
Body.prototype.addTriangle = function(
  width, // in px
  angle, // in radians
  collisionGroup,
  collisionMask,
  offsetX = 0, // in px
  offsetY = 0, // in px
) {
  // vertices of a p2 convex are given in CCW direction
  var vertices = [
    [util.pxToP2(offsetX + width*Math.cos(Math.PI/6 + angle)), util.pxToP2(offsetY + width*Math.sin(Math.PI/6 + angle))],
    [util.pxToP2(offsetX), util.pxToP2(offsetY)],
    [util.pxToP2(offsetX + width*Math.cos(-Math.PI/6 + angle)), util.pxToP2(offsetY + width*Math.sin(-Math.PI/6 + angle))],
  ];

  var bodyTriangle = new p2.Convex({ vertices: vertices });
  bodyTriangle.collisionMask = collisionMask;
  bodyTriangle.collisionGroup = collisionGroup;
  this.addShape(bodyTriangle);
};

module.exports = Body;
