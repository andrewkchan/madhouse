// util functions
function pxToP2(px) {
  // convert pixels to p2 units
  return px * -0.05;
}

function p2ToPx(p2Units) {
  return p2Units * -20;
}

exports.pxToP2 = pxToP2;
exports.p2ToPx = p2ToPx;
