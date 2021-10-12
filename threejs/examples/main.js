import * as THREE from '../build/three.module.js';
import { OBJLoader } from './jsm/loaders/OBJLoader.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { GUI } from './jsm/libs/dat.gui.module.js';
import { csvParse } from "https://cdn.skypack.dev/-/d3-dsv@v3.0.1-u1xCRjaLJc0qqv1Z5ERe/dist=es2020,mode=imports/optimized/d3-dsv.js";
import { FontLoader } from './jsm/loaders/FontLoader.js';


let scene, camera, controls;
var ebbox = new THREE.Box3();
let xmin, xmax, ymin, ymax, zmin, zmax;

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


	var loadedOBJs = new THREE.Group();
	loadedOBJs.name = 'OBJContainer';
	scene.add(loadedOBJs);
	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0000.obj', 5, loadedOBJs);
	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0001.obj', 4, loadedOBJs);
	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0002.obj', 3, loadedOBJs);
	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0003.obj', 2, loadedOBJs);
	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0004.obj', 1, loadedOBJs);
	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0005.obj', 0, loadedOBJs);

	loadCSV('/B_Complex/TextFeatures/tanks.csv', 929, 1820);
}

function loadCSV(fileName, rowMin, rowMax) {
	const csvloader = new THREE.FileLoader();
	csvloader.load(fileName,
		function (data) {
			var csvData = csvParse(data);
			for (let i = rowMin; i < rowMax; i++) {
				
				let xpos = parseFloat(csvData[i - 1].X);
				let ypos = 200;
				let zpos = parseFloat(csvData[i - 1].Y) * -1;
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


function loadOBJ(fileName, renderOrder, objContainer) {
	const loader = new OBJLoader();
	loader.load(fileName, function (obj) {

		var object = obj;
		object.rotation.x = -Math.PI / 2;

		object.traverse(function (child) {
			if (child.isMesh) {
				child.material = objMaterial;
				child.castShadow = true;
				child.geometry.computeVertexNormals(true);
			}
		});

		
		object.renderOrder = renderOrder;

		objContainer.add(object);
		setCameraAndBBox(objContainer);
	});
}

function setCameraAndBBox(object) {
	var middle = new THREE.Vector3();
	var bbox = new THREE.Box3().setFromObject(object);

	middle.x = (bbox.max.x + bbox.min.x) / 2;
	middle.y = (bbox.max.y + bbox.min.y) / 2;
	middle.z = (bbox.max.z + bbox.min.z) / 2;

	if (ebbox.min == undefined) {
		ebbox = bbox;
		createAxisText(ebbox.min.x, ebbox.min.y, ebbox.min.z, xmin, ebbox.min.x);
	} else {
		if (bbox.min.x < ebbox.min.x) {
			ebbox.min.x = bbox.min.x;
		}
		if (bbox.min.y < ebbox.min.y) {
			ebbox.min.y = bbox.min.y;
		}
		if (bbox.min.z < ebbox.min.z) {
			ebbox.min.z = bbox.min.z;
		}
		if (bbox.max.x > ebbox.max.x) {
			ebbox.max.x = bbox.max.x;
		}
		if (bbox.max.y > ebbox.max.y) {
			ebbox.max.y = bbox.max.y;
		}
		if (bbox.max.z > ebbox.max.z) {
			ebbox.max.z = bbox.max.z;
		}
    }

	var boundingBoxHelper = new THREE.Box3Helper(ebbox, 0xffffff);
	createAxisText(ebbox.min.x, ebbox.min.y, ebbox.min.z)
	scene.add(boundingBoxHelper);

	camera.position.set(middle.x, bbox.max.y, bbox.max.z);
	camera.lookAt(middle.x, middle.y, middle.z);
	controls.target.set(middle.x, middle.y, middle.z);
}

function createAxisText(x,y,z, axis, label) {

	const loader = new FontLoader();
	loader.load('fonts/helvetiker_regular.typeface.json', function (response) {

		var font = response;

		var textGeo = new THREE.TextGeometry(label, {
			size: 5,
			height: 2,
			curveSegments: 6,
			font: font
		});

		var color = new THREE.Color();
		color.setRGB(255, 250, 250);
		var textMaterial = new THREE.MeshBasicMaterial({ color: color });
		axis = new THREE.Mesh(textGeo, textMaterial);

		axis.position.x = x;
		axis.position.y = y;
		axis.position.z = z;
		
		scene.add(text);

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