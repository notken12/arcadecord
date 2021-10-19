import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

function Table(scene) {
    this.scene = scene;
    const loader = new GLTFLoader();

    loader.load('../public/3d_models/table.glb', function (gltf) {

        var model = gltf.scene;
        model.scale.multiplyScalar(100);

        model.traverse((o) => {
            if (o.type == 'mesh') {
                o.castShadow = true;
                o.receiveShadow = true;

            };
        })

        scene.add(model);

    }, undefined, function (error) {

        console.error(error);

    });
}

Table.LEN_Z = 254; //cm, play area
Table.LEN_X = 127; //cm, play area

export {
    Table
}