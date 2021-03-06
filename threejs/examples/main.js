import * as THREE from '../build/three.module.js';
import { OBJLoader } from './jsm/loaders/OBJLoader.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { GUI } from './jsm/libs/dat.gui.module.js';
import { csvParse } from "https://cdn.skypack.dev/-/d3-dsv@v3.0.1-u1xCRjaLJc0qqv1Z5ERe/dist=es2020,mode=imports/optimized/d3-dsv.js";
import { FontLoader } from './jsm/loaders/FontLoader.js';
import { Lut } from './jsm/math/Lut.js';


let scene, camera, uiscene, orthocamera, controls, renderer, originalAspect, viewSize;
var ebbox = new THREE.Box3();
let lut, sprite, objMaterial, objMaterial0, objMaterial1, objMaterial2, objMaterial3, objMaterial4, objMaterial5;
const cameraGroup = new THREE.Group();


const objParams = {
	num: 5,
	opacity: 0.1,
	white: false
};

var tankMaterial = new THREE.MeshPhongMaterial({
	color: 'rgb(255,0,0)'
})

var wellMaterial = new THREE.MeshPhongMaterial({
	color: 'rgb(255,255,0)'
})

const clipPlaneMaterial = new THREE.MeshBasicMaterial({
	color: 'rgb(100,100,100)',
	side: THREE.DoubleSide
});

let clipPlanes, clipPlaneObjects, clipPlaneHelpers, clipObject, clipPlaneGeom;
const clipParams = {
	planeX: {
		constant: 0,
		negated: false,
		displayHelper: false
	},
	planeY: {
		constant: 0,
		negated: false,
		displayHelper: false
	},
	planeZ: {
		constant: 0,
		negated: false,
		displayHelper: false
	}
};

function init(){
	scene = new THREE.Scene();
	uiscene = new THREE.Scene();

	lut = new Lut();
	
	var gui = new GUI();

	camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth/window.innerHeight,
		1,
		10000
	);

	viewSize = 2;
	var aspectRatio = window.innerWidth / window.innerHeight;
	originalAspect = window.innerWidth / window.innerHeight;
    orthocamera = new THREE.OrthographicCamera(-aspectRatio * viewSize / 2, aspectRatio * viewSize / 2, viewSize / 2, -viewSize / 2, 1, 2);
	//orthocamera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 1, 2 );
	orthocamera.position.set( 1, 0.5, 1 );

	sprite = new THREE.Sprite( new THREE.SpriteMaterial( {
		map: new THREE.CanvasTexture( lut.createCanvas() )
	} ) );
	sprite.scale.x = 0.0625;
	sprite.scale.y = 0.5;
	uiscene.add( sprite );
	createCbarAxisText(0.05,-0.2083,0,'0', '0')
	createCbarAxisText(0.05,-0.125,0,'1', '1')
	createCbarAxisText(0.05,-0.0417,0,'2', '2')
	createCbarAxisText(0.05,0.0417,0,'3', '3')
	createCbarAxisText(0.05,0.125,0,'4', '4')
	createCbarAxisText(0.05,0.2083,0,'5', '5')
	

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

	var loadedOBJs = new THREE.Group();
	loadedOBJs.name = 'OBJContainer';
	var loadedTanks = new THREE.Group();
	var loadedWells = new THREE.Group();

	scene.add(loadedOBJs);
	scene.add(loadedTanks);
	scene.add(loadedWells);

	var folder2 = gui.addFolder('Surfaces');
	folder2.add(objParams, 'num', 0, 5).name('Show Surface').onChange(function (value) {
		loadedOBJs.traverse(function (child) {
			if (parseInt(child.name) > value) {
				child.visible = false;
			} else {
				child.visible = true;
			}
		});
	});
	var folder3 = gui.addFolder('Features');
	folder3.add(loadedTanks, 'visible').name('Tanks').setValue(false);
	folder3.add(loadedWells, 'visible').name('Wells').setValue(false);

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.localClippingEnabled = true;
	renderer.autoClear = false;
	document.getElementById('webgl').appendChild(renderer.domElement);


	controls = new OrbitControls(camera, renderer.domElement);

	//clip planes
	clipPlaneObjects = [];
	clipObject = new THREE.Group();
	clipObject.rotation.x = -Math.PI / 2;
	scene.add(clipObject);
	clipPlaneGeom = [
		new THREE.PlaneGeometry(611, 79.286),
		new THREE.PlaneGeometry(764, 611),
		new THREE.PlaneGeometry(764, 79.286)
	];
	clipPlanes = [
		new THREE.Plane(new THREE.Vector3(1, 0, 0), 573195),
		new THREE.Plane(new THREE.Vector3(0, -1, 0), 206.286),
		new THREE.Plane(new THREE.Vector3(0, 0, -1), -137114)
	];
	clipPlaneHelpers = [
		new THREE.Mesh(clipPlaneGeom[0], clipPlaneMaterial),
		new THREE.Mesh(clipPlaneGeom[1], clipPlaneMaterial),
		new THREE.Mesh(clipPlaneGeom[2], clipPlaneMaterial)
	];
	clipPlaneHelpers[0].rotation.y = Math.PI / 2;
	clipPlaneHelpers[1].rotation.x = Math.PI / 2;

	update(renderer, scene, camera, controls);

	objMaterial = new THREE.MeshPhongMaterial({
		color: 'rgb(120,120,120)',
		side: THREE.DoubleSide,
		opacity: 0.1,
		transparent: true,
		clippingPlanes: clipPlanes,
		clipShadows: true
	});

	objMaterial0 = new THREE.MeshPhongMaterial({
		color: 'rgb(68, 1, 84)',
		side: THREE.DoubleSide,
		opacity: 0.1,
		transparent: true,
		clippingPlanes: clipPlanes,
		clipShadows: true
	});

	objMaterial1 = new THREE.MeshPhongMaterial({
		color: 'rgb(65, 68, 135)',
		side: THREE.DoubleSide,
		opacity: 0.1,
		transparent: true,
		clippingPlanes: clipPlanes,
		clipShadows: true
	});

	objMaterial2 = new THREE.MeshPhongMaterial({
		color: 'rgb(42, 120, 142)',
		side: THREE.DoubleSide,
		opacity: 0.1,
		transparent: true,
		clippingPlanes: clipPlanes,
		clipShadows: true
	});

	objMaterial3 = new THREE.MeshPhongMaterial({
		color: 'rgb(34, 168, 132)',
		side: THREE.DoubleSide,
		opacity: 0.1,
		transparent: true,
		clippingPlanes: clipPlanes,
		clipShadows: true
	});

	objMaterial4 = new THREE.MeshPhongMaterial({
		color: 'rgb(122, 209, 81)',
		side: THREE.DoubleSide,
		opacity: 0.1,
		transparent: true,
		clippingPlanes: clipPlanes,
		clipShadows: true
	});

	objMaterial5 = new THREE.MeshPhongMaterial({
		color: 'rgb(253, 231, 37)',
		side: THREE.DoubleSide,
		opacity: 0.1,
		transparent: true,
		clippingPlanes: clipPlanes,
		clipShadows: true
	});


	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0000.obj', 5, loadedOBJs, objMaterial0);
	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0001.obj', 4, loadedOBJs, objMaterial1);
	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0002.obj', 3, loadedOBJs, objMaterial2);
	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0003.obj', 2, loadedOBJs, objMaterial3);
	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0004.obj', 1, loadedOBJs, objMaterial4);
	loadOBJ('/B_Complex/OBJFiles/bcomplex_ert_0005.obj', 0, loadedOBJs, objMaterial5);

	loadCSV2D('/B_Complex/TextFeatures/tanks.csv', 929, 1820, loadedTanks);
	loadCSV3D('/B_Complex/TextFeatures/B_Complex_wells_201201.csv', loadedWells);

	//Clipping GUI
	var folder3 = gui.addFolder('Clipping');
	folder3.add(clipPlaneHelpers[0], 'visible').name('X-Display Helper').setValue(false);
	folder3.add(clipPlaneHelpers[1], 'visible').name('Y-Display Helper').setValue(false);
	folder3.add(clipPlaneHelpers[2], 'visible').name('Z-Display Helper').setValue(false);
	folder3.add(clipParams.planeX, 'constant').name('X-Position').min(573195).max(573959).setValue(573195).onChange(d => {
		clipPlaneHelpers[0].position.x = d;
		if (clipParams.planeX.negated) {
			clipPlanes[0].constant = d;
        } else {
			clipPlanes[0].constant = -d;
        }
	});
	folder3.add(clipParams.planeY, 'constant').name('Y-Position').min(127).max(206.286).setValue(206.286).onChange(d => {
		clipPlaneHelpers[1].position.y = d;
		if (clipParams.planeY.negated) {
			clipPlanes[1].constant = -d;
		} else {
			clipPlanes[1].constant = d;
		}
	});
	folder3.add(clipParams.planeZ, 'constant').name('Z-Position').min(137114).max(137725).setValue(137114).onChange(d => {
		clipPlaneHelpers[2].position.z = -d;
		if (clipParams.planeY.negated) {
			clipPlanes[2].constant = d;
		} else {
			clipPlanes[2].constant = -d;
		}
	});
	folder3.add(clipParams.planeX, 'negated').name('Invert X').onChange(() => {
		clipPlanes[0].negate();
	});
	folder3.add(clipParams.planeY, 'negated').name('Invert Y').onChange(() => {
		clipPlanes[1].negate();
	});
	folder3.add(clipParams.planeY, 'negated').name('Invert Z').onChange(() => {
		clipPlanes[2].negate();
	});


	var folder4 = gui.addFolder('Color');
	folder4.add(objParams, 'white').name('White').setValue(false).onChange(function (value){
		if (value){
			sprite.visible = false;
			loadedOBJs.traverse(function (child){
				if (child.isMesh){
					child.material = objMaterial;
				}
			});	
		}else{ 
			sprite.visible = true;
			loadedOBJs.traverse(function (child){
				if (child.name == '0'){
					child.traverse( function (newChild){
						if (newChild.isMesh){
							newChild.material = objMaterial5;
						}
					});
				}else if (child.name == '1'){
					child.traverse( function (newChild){
						if (newChild.isMesh){
							newChild.material = objMaterial4;
						}
					});
				}else if (child.name == '2'){
					child.traverse( function (newChild){
						if (newChild.isMesh){
							newChild.material = objMaterial3;
						}
					});
				}else if (child.name == '3'){
					child.traverse( function (newChild){
						if (newChild.isMesh){
							newChild.material = objMaterial2;
						}
					});
				}else if (child.name == '4'){
					child.traverse( function (newChild){
						if (newChild.isMesh){
							newChild.material = objMaterial1;
						}
					});
				}else if (child.name == '5'){
					child.traverse( function (newChild){
						if (newChild.isMesh){
							newChild.material = objMaterial0;
						}
					});
				}
			});
		}
	});
	folder4.add(objParams, 'opacity', 0, 1).name('Opacity').onChange(function (value) {
		loadedOBJs.traverse(function (child) {
			if (child.isMesh) {
				child.material.opacity = value;
			}
		});
	});

	window.addEventListener( 'resize', onWindowResize );

	console.log(scene);
}

function setupClipPlane(geometry) {
	for (let i = 0; i < 3; i++) {

		const poGroup = new THREE.Group();
		const plane = clipPlanes[i];
		const stencilGroup = createPlaneStencilGroup(geometry, plane, i + 1);

		// plane is clipped by the other clipping planes
		const planeMat =
			new THREE.MeshStandardMaterial({

				color: 0xE91E63,
				metalness: 0.1,
				roughness: 0.75,
				clippingPlanes: clipPlanes.filter(p => p !== plane),

				stencilWrite: true,
				stencilRef: 0,
				stencilFunc: THREE.NotEqualStencilFunc,
				stencilFail: THREE.ReplaceStencilOp,
				stencilZFail: THREE.ReplaceStencilOp,
				stencilZPass: THREE.ReplaceStencilOp,

			});
		const po = new THREE.Mesh(clipPlaneGeom[i], planeMat);
		po.onAfterRender = function (renderer) {

			renderer.clearStencil();

		};

		po.renderOrder = i + 1.1;

		clipObject.add(stencilGroup);
		poGroup.add(po);
		clipPlaneObjects.push(po);
		scene.add(poGroup);

	}
}


function createPlaneStencilGroup(geometry, plane, renderOrder) {

	const group = new THREE.Group();
	const baseMat = new THREE.MeshBasicMaterial();
	baseMat.depthWrite = false;
	baseMat.depthTest = false;
	baseMat.colorWrite = false;
	baseMat.stencilWrite = true;
	baseMat.stencilFunc = THREE.AlwaysStencilFunc;

	// back faces
	const mat0 = baseMat.clone();
	mat0.side = THREE.BackSide;
	mat0.clippingPlanes = [plane];
	mat0.stencilFail = THREE.IncrementWrapStencilOp;
	mat0.stencilZFail = THREE.IncrementWrapStencilOp;
	mat0.stencilZPass = THREE.IncrementWrapStencilOp;

	const mesh0 = new THREE.Mesh(geometry, mat0);
	mesh0.renderOrder = renderOrder;
	group.add(mesh0);

	// front faces
	const mat1 = baseMat.clone();
	mat1.side = THREE.FrontSide;
	mat1.clippingPlanes = [plane];
	mat1.stencilFail = THREE.DecrementWrapStencilOp;
	mat1.stencilZFail = THREE.DecrementWrapStencilOp;
	mat1.stencilZPass = THREE.DecrementWrapStencilOp;

	const mesh1 = new THREE.Mesh(geometry, mat1);
	mesh1.renderOrder = renderOrder;

	group.add(mesh1);

	return group;

}

function loadCSV2D(fileName, rowMin, rowMax, threeGroup) {
	const csvloader = new THREE.FileLoader();
	csvloader.load(fileName,
		function (data) {
			var csvData = csvParse(data);
			for (let i = rowMin; i < rowMax; i++) {
				
				let xpos = parseFloat(csvData[i - 1].X);
				let ypos = 203.132;
				let zpos = parseFloat(csvData[i - 1].Y) * -1;
				getGeometry('sphere', 1, tankMaterial, xpos, ypos, zpos, threeGroup);
				
			}
		}
	);
}

function loadCSV3D(fileName, threeGroup) {
	const csvloader = new THREE.FileLoader();
	csvloader.load(fileName,
		function (data) {
			var csvData = csvParse(data);
			for (let i = 0; i < csvData.length; i++) {

				if (csvData[i].Z != 0) {
					let xpos = parseFloat(csvData[i].X);
					let ypos = parseFloat(csvData[i].Z);
					let zpos = parseFloat(csvData[i].Y) * -1;
					getGeometry('sphere', 1, wellMaterial, xpos, ypos, zpos, threeGroup);
				}
			}
		}
	);
}

function getGeometry(type, size, material, xpos, ypos, zpos, threeGroup) {
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

	threeGroup.add(obj);
}

var loadedMeshes = 0;

function loadOBJ(fileName, renderOrder, objContainer, colorrgb) {
	const loader = new OBJLoader();
	loader.load(fileName, function (obj) {

		var object = obj;
		object.rotation.x = -Math.PI / 2;

		object.traverse(function (child) {
			if (child.isMesh) {
				child.material = colorrgb;
				child.castShadow = false;
				child.receiveShadow = false;
				child.geometry.computeVertexNormals(true);

				//if (renderOrder == 0) {
				//	setupClipPlane(child.geometry);
				//}

			}
		});

		object.renderOrder = renderOrder;
		object.name = renderOrder.toString();

		objContainer.add(object);

		loadedMeshes += 1;

		if (loadedMeshes == 6){
			setCameraAndBBox(objContainer);
		}
		

	});
}

function setCameraAndBBox(object) {
	var middle = new THREE.Vector3();
	var bbox = new THREE.Box3().setFromObject(object);

	middle.x = (bbox.max.x + bbox.min.x) / 2;
	middle.y = (bbox.max.y + bbox.min.y) / 2;
	middle.z = (bbox.max.z + bbox.min.z) / 2;

	if (bbox.min.x < ebbox.min.x) {
		ebbox.min.x = bbox.min.x;
		updateAxisText(ebbox);
	}
	if (bbox.min.y < ebbox.min.y) {
		ebbox.min.y = bbox.min.y;
		updateAxisText(ebbox);
	}
	if (bbox.min.z < ebbox.min.z) {
		ebbox.min.z = bbox.min.z;
		updateAxisText(ebbox);
	}
	if (bbox.max.x > ebbox.max.x) {
		ebbox.max.x = bbox.max.x;
		updateAxisText(ebbox);
	}
	if (bbox.max.y > ebbox.max.y) {
		ebbox.max.y = bbox.max.y;
		updateAxisText(ebbox);
	}
	if (bbox.max.z > ebbox.max.z) {
		ebbox.max.z = bbox.max.z;
		updateAxisText(ebbox);
	}

	if (!scene.getObjectByName('boundingBox')) {
		var boundingBoxHelper = new THREE.Box3Helper(ebbox, 0xffffff);
		boundingBoxHelper.name = 'boundingBox';
		scene.add(boundingBoxHelper);
		
		createAxisText(ebbox.min.x, ebbox.min.y, ebbox.max.z, 'xmin', ebbox.min.x);
		createAxisText(ebbox.max.x, ebbox.min.y, ebbox.max.z, 'xmax', ebbox.max.x);
		createAxisText(ebbox.min.x, ebbox.min.y, ebbox.max.z, 'ymin', ebbox.min.y);
		createAxisText(ebbox.min.x, ebbox.max.y, ebbox.max.z, 'ymax', ebbox.max.y);
		createAxisText(ebbox.min.x, ebbox.min.y, ebbox.max.z, 'zmin', -ebbox.max.z);
		createAxisText(ebbox.min.x, ebbox.min.y, ebbox.min.z, 'zmax', -ebbox.min.z);
	}

	camera.position.set(middle.x, bbox.max.y + 200, bbox.max.z + 500);
	camera.lookAt(middle.x, middle.y, middle.z);

	console.log(middle);

	cameraGroup.position.set(middle.x, bbox.max.y + 200, bbox.max.z + 500);
	cameraGroup.lookAt(middle.x, middle.y, middle.z);

	controls.target.set(middle.x, middle.y, middle.z);
	clipPlaneHelpers[0].position.set(ebbox.min.x, middle.y, middle.z);
	clipPlaneHelpers[1].position.set(middle.x, ebbox.max.y, middle.z);
	clipPlaneHelpers[2].position.set(middle.x, middle.y, ebbox.max.z);
}

function createAxisText(x,y,z, axisName, label) {

	const loader = new FontLoader();
	loader.load('fonts/helvetiker_regular.typeface.json', function (response) {

		var font = response;

		var textGeo = new THREE.TextGeometry(label.toFixed(3), {
			size: 5,
			height: 0.1,
			curveSegments: 6,
			font: font
		});

		var color = new THREE.Color();
		color.setRGB(255, 250, 250);
		var textMaterial = new THREE.MeshBasicMaterial({ color: color });
		var axis = new THREE.Mesh(textGeo, textMaterial);

		if (axisName == 'xmin') {
			axis.rotation.x = -Math.PI / 2;
			axis.rotation.z = -Math.PI / 2;
		}
		if (axisName == 'xmax') {
			axis.rotation.x = -Math.PI / 2;
			axis.rotation.z = -Math.PI / 2;
		}
		if (axisName == 'ymin') {
		}
		if (axisName == 'zmin') {
			axis.rotation.x = -Math.PI / 2;
		}
		if (axisName == 'zmax') {
			axis.rotation.x = -Math.PI / 2;
		}


		axis.position.x = x;
		axis.position.y = y;
		axis.position.z = z;
		axis.name = axisName;

		scene.add(axis);
	});

}

function updateAxisText(boundingBox) {
	if (scene.getObjectByName('xmin')) {
		var obj = scene.getObjectByName('xmin');
		obj.position.x = boundingBox.min.x;
		obj.position.y = boundingBox.min.y;
		obj.position.z = boundingBox.max.z;
	}
	if (scene.getObjectByName('ymin')) {
		var obj = scene.getObjectByName('ymin');
		obj.position.x = boundingBox.min.x;
		obj.position.y = boundingBox.min.y;
		obj.position.z = boundingBox.max.z;
	}
	if (scene.getObjectByName('zmax')) {
		var obj = scene.getObjectByName('zmax');
		obj.position.x = boundingBox.min.x;
		obj.position.y = boundingBox.min.y;
		obj.position.z = boundingBox.min.z;
	}
	if (scene.getObjectByName('xmax')) {
		var obj = scene.getObjectByName('xmax');
		obj.position.x = boundingBox.max.x;
		obj.position.y = boundingBox.min.y;
		obj.position.z = boundingBox.max.z;
	}
	if (scene.getObjectByName('ymax')) {
		var obj = scene.getObjectByName('ymax');
		obj.position.x = boundingBox.min.x;
		obj.position.y = boundingBox.max.y;
		obj.position.z = boundingBox.max.z;
	}
	if (scene.getObjectByName('zmin')) {
		var obj = scene.getObjectByName('zmin');
		obj.position.x = boundingBox.min.x;
		obj.position.y = boundingBox.min.y;
		obj.position.z = boundingBox.max.z;
	}
}

function createCbarAxisText(x,y,z, axisName, label) {

	const loader = new FontLoader();
	loader.load('fonts/helvetiker_regular.typeface.json', function (response) {

		var font = response;

		var textGeo = new THREE.TextGeometry(label, {
			size: 0.025,
			height: 0.001,
			curveSegments: 6,
			font: font
		});

		var color = new THREE.Color();
		color.setRGB(255, 250, 250);
		var textMaterial = new THREE.MeshBasicMaterial({ color: color });
		var axisLabel = new THREE.Mesh(textGeo, textMaterial);

		axisLabel.position.x = x;
		axisLabel.position.y = y;
		axisLabel.position.z = -0.05;
		axisLabel.name = axisName;

		sprite.attach(axisLabel);
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


function onWindowResize() {
	
	var aspect = window.innerWidth / window.innerHeight;
    var change = originalAspect / aspect;
    var newSize = viewSize * change;
    orthocamera.left = -aspect * newSize / 2;
    orthocamera.right = aspect * newSize  / 2;
    orthocamera.top = newSize / 2;
    orthocamera.bottom = -newSize / 2;
	orthocamera.updateProjectionMatrix();
	
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}



function update(renderer, scene, camera, controls) {
	for (let i = 0; i < clipPlaneObjects.length; i++) {

		const plane = clipPlanes[i];
		const planeHelper = clipPlaneHelpers[i];
		const po = clipPlaneObjects[i];
		//plane.coplanarPoint(po.position);
		po.position.set(planeHelper.position.x, planeHelper.position.y, planeHelper.position.z);

		po.lookAt(
			po.position.x - plane.normal.x,
			po.position.y - plane.normal.y,
			po.position.z - plane.normal.z,
		);

	}


	renderer.clear();
	renderer.render(
		scene,
		camera
	);
	
	renderer.render( uiscene, orthocamera );

	controls.update();

	requestAnimationFrame(function(){
		update(renderer, scene, camera, controls);
	});
}

init();