import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

//import cannon
import * as CANNON from "cannon-es";
import { CannonUtils } from "./CannonUtils";


//import { threeToCannon, ShapeType } from 'three-to-cannon';

function Part(mesh, body) {
    this.mesh = mesh;
    this.body = body;
}

Part.prototype.tick = function () {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
}

function Table(scene, cannonWorld) {
    var that = this;

    this.scene = scene;
    this.cannonWorld = cannonWorld;
    this.parts = [];
    const loader = new GLTFLoader();

    loader.load('../public/3d_models/table.glb', function (gltf) {

        var model = gltf.scene;

        model.traverse((o) => {
            if (o.type == 'Mesh') {
                o.castShadow = true;
                o.receiveShadow = true;

                var geometry = o.geometry;

                //create cannon trimesh from loaded obj file
                //var shape = CannonUtils.createTrimesh(o.geometry);
                //var shape = threeToCannon(o);

                //generate points from geometry vertices

                //geometry vertices
                var vertices = geometry.attributes.position.array;

                //geometry indices
                
                var points = [];
                for(var i = 0; i < geometry.index.array.count; i+=3){
                    var index = geometry.index.array[i];
                    var x = vertices[index*3];
                    var y = vertices[index*3+1];
                    var z = vertices[index*3+2];
                    points.push(new CANNON.Vec3(x,y,z));
                }

                //generate trimesh from points
                var shape = new CANNON.Trimesh(points, geometry.index.array);

                
                //generate faces from geometry
                // var faces = indices.map(function (f) {
                //     return [f.a, f.b, f.c];
                // });

                //var shape = new CANNON.ConvexPolyhedron(points, faces);
                
                var body = new CANNON.Body({
                    mass: 0,
                    material: new CANNON.Material('tableMaterial'),
                    shape: shape
                });

                body.position.copy(o.position);
                body.quaternion.copy(o.quaternion);

                that.cannonWorld.addBody(body);

                that.parts.push(new Part(o, body));

                //scene.add(o);
            }
        })

        //scene.add(model);

    }, function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, function (error) {

        console.error(error);

    });
}

Table.prototype.tick = function () {
    this.parts.forEach(function (part) {
        part.tick();
    });
}

Table.LEN_Z = 254; //cm, play area
Table.LEN_X = 127; //cm, play area

export {
    Table
}