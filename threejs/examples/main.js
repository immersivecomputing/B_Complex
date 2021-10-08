import * as THREE from '../build/three.module.js';
import { OBJLoader } from './jsm/loaders/OBJLoader.js';

let object;

function init(){
	var scene = new THREE.Scene();

	var camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth/window.innerHeight,
		1,
		1000
	);

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.getElementById('webgl').appendChild(renderer.domElement);
	renderer.render(
		scene,
		camera
	);
	
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
				
				geometry.computeBoundingBox();
				middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
				middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
				middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;
					
				camera.position = child.geometry.boundinBox.min;
				camera.lookAt(middle);
			}
		});
		console.log(object);
		scene.add(object);

	} );
	
}

init();