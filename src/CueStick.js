import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { mode } from "../webpack.config";
import { Ball } from "./Ball";
import { Table } from "./Table";

// obj - your object (THREE.Object3D or derived)
// point - the point of rotation (THREE.Vector3)
// axis - the axis of rotation (normalized THREE.Vector3)
// theta - radian value of rotation
// pointIsWorld - boolean indicating the point is in world coordinates (default = false)
function rotateAboutPoint(obj, point, axis, theta, pointIsWorld){
    pointIsWorld = (pointIsWorld === undefined)? false : pointIsWorld;

    if(pointIsWorld){
        obj.parent.localToWorld(obj.position); // compensate for world coordinate
    }

    obj.position.sub(point); // remove the offset
    obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
    obj.position.add(point); // re-add the offset

    if(pointIsWorld){
        obj.parent.worldToLocal(obj.position); // undo world coordinates compensation
    }

    obj.rotateOnAxis(axis, theta); // rotate the OBJECT
}

function CueStick(scene) {
    this.scene = scene;
    const loader = new GLTFLoader();

    loader.load('../public/3d_models/cue_stick.glb', function (gltf) {

        var model = gltf.scene;
        model.scale.multiplyScalar(100);
        
        model.position.y = Ball.RADIUS;
        model.position.z = Table.LEN_Z / -4;
        model.rotateOnAxis(new THREE.Vector3(0,1,0), Math.PI);

        model.traverse((o) => {
            if (o.type == 'Mesh') {
                o.castShadow = true;
                o.receiveShadow = true;
                o.position.z = (Ball.RADIUS + CueStick.BALL_DISTANCE)*0.01;
                console.log(o.position.z);
                //o.position.z = 1;
                //rotateAboutPoint(o, new THREE.Vector3(0, Ball.RADIUS, Table.LEN_Z / -4), new THREE.Vector3(0, 1, 0), Math.PI/2, true);

            };
        })

        scene.add(model);

    }, undefined, function (error) {

        console.error(error);

    });
}

CueStick.BALL_DISTANCE = 1; //cm, determines how close the cue stick is held behind the ball

export {
    CueStick
}