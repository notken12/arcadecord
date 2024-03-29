// main.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { InputHandler } from './InputHandler';

//import datgui
import * as dat from 'dat.gui';

import { Game } from './Game';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

var width = window.innerWidth;
var height = window.innerHeight;
const camera = new THREE.OrthographicCamera(
  width / -2,
  width / 2,
  height / 2,
  height / -2,
  0.1,
  1000
);
camera.position.set(0, 300, 0);
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

const gridHelper = new THREE.GridHelper(size, divisions);
gridHelper.position.set(0, 5, 0);
//scene.add( gridHelper );

var game = new Game(scene);
game.setStickRotation(Math.PI);

var inputHandler = new InputHandler(renderer, scene, game);

const gui = new dat.GUI();

var clock = new THREE.Clock();
clock.start();

const animate = function () {
  requestAnimationFrame(animate);

  var td = clock.getDelta();

  inputHandler.tick(td);

  game.tick();

  renderer.render(scene, camera);
};

animate();
