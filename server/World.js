var p2 = require("p2");
var Group = require("./CollisionGroup");
var util = require("./util");
var ServerBullet = require("./ServerBullet");

function World(width, height) {
  p2.World.call(this);

  // turn off things we aren't using
  this.defaultContactMaterial.friction = 0;
  this.applyGravity = false;
  this.applySpringForces = false;
  this.emitImpactEvent = false;

  // create world bounds and collision walls
  this.bounds = {
    width: width,
    height: height,
  };

  function addPlaneBound(x, y, angle) {
    var body = new p2.Body({ mass: 0, position: [ util.pxToP2(x), util.pxToP2(y) ], angle: angle });
    var plane = new p2.Plane();
    plane.collisionGroup = Group.TILES;
    plane.collisionMask = Group.ACTORS | Group.BULLETS;
    body.addShape(plane);
    return body;
  }
  this.walls = {
    top: addPlaneBound(0, 0, -3.141592653589793),
    bottom: addPlaneBound(0, height),
    left: addPlaneBound(0, 0, 1.5707963267948966),
    right: addPlaneBound(width, 0, -1.5707963267948966),
  };
  // this.addBody(this.walls.top);
  // this.addBody(this.walls.bottom);
  // this.addBody(this.walls.left);
  // this.addBody(this.walls.right);

  this.on("beginContact", function(e) {
    // note: tiles do not have entity attributes
    var entityA = e.bodyA.entity;
    var entityB = e.bodyB.entity;
    console.log(`Collision event:: entities A:${entityA} B:${entityB}`);

    if (entityA && entityB) {
      entityA.collideWith(entityB);
      entityB.collideWith(entityA);
    } else if (entityA) {
      entityA.collideWithWall();
    } else if (entityB) {
      entityB.collideWithWall();
    }
  });
}

World.prototype = Object.create(p2.World.prototype);
World.prototype.constructor = World;

World.prototype.debugBodies = function() {
  console.log("============");
  this.bodies.forEach(function(body) {
    var entity = body.entity;
    if (entity && entity.id) {
      console.log(`Body with entity id ${entity.id}, type ${entity.constructor.name} at (${body.x}, ${body.y}), velocity: (${body.velocity[0]}, ${body.velocity[1]})`);
      // body.shapes.forEach(function(shape) {
      //   console.log(`width: ${shape.width} height: ${shape.height}`);
      // });
    } else {
      //console.log(`Body at x:${body.x} y:${body.y}`);
    }
  });
  console.log("============");
};

module.exports = World;
