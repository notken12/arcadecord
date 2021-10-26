import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

//import cannon
import * as CANNON from "cannon-es";
import { CannonUtils } from "./CannonUtils";

import { threeToCannon, ShapeType } from 'three-to-cannon';

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

                var geometry = o.geometry.toNonIndexed();

                //create cannon trimesh from loaded obj file
                //var shape = CannonUtils.createTrimesh(o.geometry);
                var shape = threeToCannon(o);
                //var shape = new CANNON.ConvexPolyhedron(geometry.vertices, geometry.faces);
                
                var body = new CANNON.Body({
                    mass: 0,
                    material: new CANNON.Material('tableMaterial'),

                });
                body.addShape(shape);

                body.position.copy(o.position);
                body.quaternion.copy(o.quaternion);

                that.cannonWorld.addBody(body);

                that.parts.push(new Part(o, body));

                scene.add(o);
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