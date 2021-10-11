import * as THREE from '../build/three.module.js';
import { OBJLoader } from './jsm/loaders/OBJLoader.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { GUI } from './jsm/libs/dat.gui.module.js';

let object;
let scene, camera, controls;
var objMaterial = new THREE.MeshPhongMaterial({
	color: 'rgb(120,120,120)',
	side: THREE.DoubleSide,
	opacity: 0.1,
	transparent: true
});

function init(){
	scene = new THREE.Scene();
	var gui = new GUI();

	camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth/window.innerHeight,
		1,
		10000
	);

	var light = getDirectionalLight(1);
	var ambientLight = getAmbientLight(1.5)
	light.position.y = 4;
	scene.add(light);
	scene.add(ambientLight);

	gui.add(ambientLight, 'intensity', 0.0, 5.0);
	gui.add(light, 'intensity', 0, 10);
	gui.add(light.position, 'x', 0, 20);
	gui.add(light.position, 'y', 0, 20);
	gui.add(light.position, 'z', 0, 20);

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.getElementById('webgl').appendChild(renderer.domElement);

	controls = new OrbitControls(camera, renderer.domElement);

	update(renderer, scene, camera, controls);

	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0000.obj', 0);
	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0001.obj', 1);
	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0002.obj', 2);
	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0003.obj', 3);
	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0004.obj', 4);
	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0005.obj', 5);
}

function loadOBJ(fileName, renderOrder) {
	const loader = new OBJLoader();
	loader.load(fileName, function (obj) {

		object = obj;
		object.rotation.x = -Math.PI / 2;

		object.traverse(function (child) {
			if (child.isMesh) {
				child.material = objMaterial;
				child.castShadow = true;
				child.geometry.computeVertexNormals(true);
			}
		});

		var middle = new THREE.Vector3();
		var bbox = new THREE.Box3().setFromObject(object);

		middle.x = (bbox.max.x + bbox.min.x) / 2;
		middle.y = (bbox.max.y + bbox.min.y) / 2;
		middle.z = (bbox.max.z + bbox.min.z) / 2;

		camera.position.set(bbox.min.x, bbox.max.y, bbox.min.z);
		camera.lookAt(middle.x, middle.y, middle.z);
		controls.target.set(middle.x, middle.y, middle.z);

		object.renderOrder = renderOrder;

		scene.add(object);

	});
}

function getDirectionalLight(intensity) {
	var light = new THREE.DirectionalLight(0xffffff, intensity);
	light.castShadow = true;

	return light;
}

function getAmbientLight(intensity) {
	var light = new THREE.AmbientLight('rgb(255,255,255)', intensity);

	return light;
}

function update(renderer, scene, camera, controls) {
	renderer.render(
		scene,
		camera
	);
	
	controls.update();

	requestAnimationFrame(function(){
		update(renderer, scene, camera, controls);
	});
}

init();