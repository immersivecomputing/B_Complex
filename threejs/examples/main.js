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

	

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.getElementById('webgl').appendChild(renderer.domElement);

	var controls = new OrbitControls(camera, renderer.domElement);

	update(renderer, scene, camera, controls);
	
	var material = new THREE.MeshBasicMaterial({
		color: 0xffffff
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

		console.log(bbox);

		middle.x = (bbox.max.x + bbox.min.x) / 2;
		middle.y = (bbox.max.y + bbox.min.y) / 2;
		middle.z = (bbox.max.z + bbox.min.z) / 2;


		camera.position.set(bbox.min.x, bbox.min.y, bbox.min.z);
		camera.lookAt(middle.x, middle.y, middle.z);
		controls.target.set(middle.x, middle.y, middle.z);


		console.log(object);
		scene.add(object);

	} );
	
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