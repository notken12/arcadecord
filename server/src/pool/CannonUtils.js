//import cannon
var CANNON = require('cannon-es');

var CannonUtils = {
    createTrimesh: function (geometry) {
        const vertices = geometry.attributes.position.array;
        const indices = Object.keys(vertices).map(Number);
        return new CANNON.Trimesh(vertices, indices);
    }
};

export {
    CannonUtils
}