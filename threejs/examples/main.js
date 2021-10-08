import * as THREE from '../build/three.module.js';
import { OBJLoader } from './jsm/loaders/OBJLoader.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';

let object;

function init(){
	var scene = new THREE.Scene();

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
		
		object.traverse( function(child){
			if (child.isMesh) {
				child.material = material;
				var geometry = child.geometry;
				var middle = new THREE.Vector3();

				child.rotation.x = Math.PI / 2;

				geometry.computeBoundingBox();
				middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
				middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
				middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;
					
				camera.position.set(geometry.boundingBox.min.x, geometry.boundingBox.min.y, geometry.boundingBox.min.z);
				camera.lookAt(middle.x, middle.y, middle.z);
				controls.target.set(middle.x, middle.y, middle.z);
			}
		});
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