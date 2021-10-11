import * as THREE from '../build/three.module.js';
import { OBJLoader } from './jsm/loaders/OBJLoader.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { GUI } from './jsm/libs/dat.gui.module.js';

let object;

function init(){
	var scene = new THREE.Scene();
	var gui = new GUI();

	var camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth/window.innerHeight,
		1,
		10000
	);

	var light = getDirectionalLight(1);
	scene.add(light);
	gui.add(light, 'intensity', 0, 10);
	gui.add(light.position, 'x', 0, 20);
	gui.add(light.position, 'y', 0, 20);
	gui.add(light.position, 'z', 0, 20);

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.getElementById('webgl').appendChild(renderer.domElement);

	var controls = new OrbitControls(camera, renderer.domElement);

	update(renderer, scene, camera, controls);
	
	var material = new THREE.MeshPhongMaterial({
		color: 'rgb(120,120,120)',
		side: THREE.DoubleSide
	});
	const loader = new OBJLoader();
	loader.load( '/B_Complex/OBJFiles/bcomplex_ert_0000.obj', function ( obj ) {

		object = obj;
		object.rotation.x = -Math.PI / 2;

		object.traverse( function(child){
			if (child.isMesh) {
				child.material = material;
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

		scene.add(object);

	} );
	
}

function getDirectionalLight(intensity) {
	var light = new THREE.DirectionalLight(0xffffff, intensity)
	light.castShadow = true;
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