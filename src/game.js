import * as THREE from "three";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";


const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
//scene.add(cube);

const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(ambientLight);

camera.position.z = 5;

const controls = new OrbitControls(camera, renderer.domElement);
console.log(controls);
controls.target.set(0, 0, 0);
controls.update();
controls.enablePan = false;
controls.enableDamping = true;

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
console.log(pointLight);
pointLight.position.set(0, 10, 0);
scene.add(pointLight);

const loader = new GLTFLoader();

loader.load('../public/3d_models/play_area.glb', function (gltf) {

    var model = gltf.scene;
    model.traverse((o) => {
        console.log(o);
        if (o.isMesh) {
            // note: for a multi-material mesh, `o.material` may be an array,
            // in which case you'd need to set `.map` on each value.
            o.material = new THREE.MeshStandardMaterial({ color: 0x10704B });
        }
    });
    scene.add(model);

}, undefined, function (error) {

    console.error(error);

});

const animate = function () {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
};

animate();