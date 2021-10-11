import * as THREE from '../build/three.module.js';
import { OBJLoader } from './jsm/loaders/OBJLoader.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { GUI } from './jsm/libs/dat.gui.module.js';
import { csvParse } from "https://cdn.skypack.dev/-/d3-dsv@v3.0.1-u1xCRjaLJc0qqv1Z5ERe/dist=es2020,mode=imports/optimized/d3-dsv.js";

let object;
let scene, camera, controls;
var objMaterial = new THREE.MeshPhongMaterial({
	color: 'rgb(120,120,120)',
	side: THREE.DoubleSide,
	opacity: 0.1,
	transparent: true
});

var tankMaterial = new THREE.MeshPhongMaterial({
	color: 'rgb(255,0,0)'
})

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

	var folder1 = gui.addFolder('Lighting');
	folder1.add(ambientLight, 'intensity', 0.0, 5.0).name('Amb. Intensity');
	folder1.add(light, 'intensity', 0, 10).name('Dir. Intensity');
	folder1.add(light.position, 'x', 0, 20).name('Dir. x-position');
	folder1.add(light.position, 'y', 0, 20).name('Dir. y-position');
	folder1.add(light.position, 'z', 0, 20).name('Dir. z-position');

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.getElementById('webgl').appendChild(renderer.domElement);

	controls = new OrbitControls(camera, renderer.domElement);

	update(renderer, scene, camera, controls);

	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0000.obj', 5);
	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0001.obj', 4);
	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0002.obj', 3);
	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0003.obj', 2);
	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0004.obj', 1);
	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0005.obj', 0);

	loadCSV('/B_Complex/TextFeatures/tanks.csv', 929, 1820);
}

function loadCSV(fileName, rowMin, rowMax) {
	const csvloader = new THREE.FileLoader();
	csvloader.load(fileName,
		function (data) {
			var csvData = csvParse(data);
			//let v3array = [];
			for (let i = rowMin; i < rowMax; i++) {
				
				let xpos = parseFloat(csvData[i - 1].X);
				let ypos = 200;
				let zpos = parseFloat(csvData[i - 1].Y) * -1;
				//v3array.push(new THREE.Vector3(xpos, ypos, zpos));
				getGeometry('sphere', 1, tankMaterial, xpos, ypos, zpos);
				
			}
		}
	);
}

function getGeometry(type, size, material, xpos, ypos, zpos) {
	var geometry;
	var segmentMultiplier = 1;
	switch (type) {
		case 'sphere':
			geometry = new THREE.SphereGeometry(size, 32 * segmentMultiplier, 32 * segmentMultiplier);
			break;
		default:
			break;
	}

	var obj = new THREE.Mesh(geometry, material);
	obj.castShadow = true;
	obj.name = type;
	obj.position.set(xpos, ypos, zpos);

	scene.add(obj);
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

		console.log(controls);

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