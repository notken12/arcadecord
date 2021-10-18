import * as THREE from "three";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

function Ball(x, y, z, name, color) {
    this.color = typeof color == 'undefined' ? 0xaa0000 : color;
    //this.texture = 'images/balls/' + name + '.png';

    this.mesh = this.createMesh(x, y, z);
    this.sphere = new THREE.Sphere(this.mesh.position, Ball.RADIUS); //used for guiding line intersection detecting
    scene.add(this.mesh);

    //this.rigidBody = this.createBody(x, y, z);
    //world.addBody(this.rigidBody);
    this.name = name;
    this.fallen = false;
}

Ball.RADIUS = 5.715 / 2; // cm
Ball.MASS = 0.170; // kg

Ball.prototype.createMesh = function (x, y, z) {
    var geometry = new THREE.SphereGeometry(Ball.RADIUS, 16, 16);
    var material = new THREE.MeshPhongMaterial({
        specular: 0xffffff,
        shininess: 140,
        reflectivity: 0.1,
        //envMap: Ball.envMap,
        combine: THREE.AddOperation,
        flatShading: false,
        color: new THREE.Color(0xff0000)
    });

    if (typeof this.texture == 'undefined') {
        material.color = new THREE.Color(this.color);
    } else {
        /*textureLoader.load(this.texture, function (tex) {
          material.map = tex;
          material.needsUpdate = true;
        });*/
    }

    var sphere = new THREE.Mesh(geometry, material);

    sphere.position.set(x, y, z);

    sphere.castShadow = true;
    sphere.receiveShadow = true;

    return sphere;
};

function Table() {
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

function Game() {
    this.table = new Table();

    var apex = Table.LEN_Z / 4;
    var zo = 1.5; //how far the balls are spaced apart on x axis

    this.balls = [
        //first row
        new Ball(0, Ball.RADIUS, apex, '9ball'),

        //second row
        new Ball(1 * Ball.RADIUS, Ball.RADIUS, apex + zo*Ball.RADIUS, '7ball'),
        new Ball(-1 * Ball.RADIUS, Ball.RADIUS, apex + zo*Ball.RADIUS, '12ball'),

        //third row
        new Ball(2 * Ball.RADIUS, Ball.RADIUS, apex + 2 * zo*Ball.RADIUS, '15ball'),
        new Ball(0 * Ball.RADIUS, Ball.RADIUS, apex + 2 * zo*Ball.RADIUS, '8ball'),
        new Ball(-2 * Ball.RADIUS, Ball.RADIUS, apex + 2 * zo*Ball.RADIUS, '1ball'),
        
        //fourth row
        new Ball(3 * Ball.RADIUS, Ball.RADIUS, apex + 3 * zo*Ball.RADIUS, '6ball'),
        new Ball(1 * Ball.RADIUS, Ball.RADIUS, apex + 3 * zo*Ball.RADIUS, '10ball'),
        new Ball(-1 * Ball.RADIUS, Ball.RADIUS, apex + 3 * zo*Ball.RADIUS, '3ball'),
        new Ball(-3 * Ball.RADIUS, Ball.RADIUS, apex + 3 * zo*Ball.RADIUS, '14ball'),

        //fifth row
        new Ball(4 * Ball.RADIUS, Ball.RADIUS, apex + 4 * zo*Ball.RADIUS, '11ball'),
        new Ball(2 * Ball.RADIUS, Ball.RADIUS, apex + 4 * zo*Ball.RADIUS, '2ball'),
        new Ball(0 * Ball.RADIUS, Ball.RADIUS, apex + 4 * zo*Ball.RADIUS, '13ball'),
        new Ball(-2 * Ball.RADIUS, Ball.RADIUS, apex + 4 * zo*Ball.RADIUS, '4ball'),
        new Ball(-4 * Ball.RADIUS, Ball.RADIUS, apex + 4 * zo*Ball.RADIUS, '5ball'),

    ]
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

var width = window.innerWidth;
var height = window.innerHeight;
const camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 0.1, 1000 );
camera.position.set(0,300,0);
camera.zoom = 2.5;


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
//scene.add(cube);

const ambientLight = new THREE.AmbientLight(0x808080); // soft white light
scene.add(ambientLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();
controls.enablePan = false;
controls.enableDamping = true;

camera.zoom = 2.5;


const pointLight = new THREE.PointLight(0xffffff, 3, 100);
pointLight.position.set(0, 15, 0);
scene.add(pointLight);

const size = 609.6;
const divisions = 20;

const gridHelper = new THREE.GridHelper( size, divisions );
gridHelper.position.set(0, 5, 0);
scene.add( gridHelper );

var game = new Game();

const animate = function () {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
};

animate();