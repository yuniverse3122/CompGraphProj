CHECKERS.BoardController = function (options) {
    'use strict';

    options = options || {};

    var containerEl = options.containerEl || null;

    var assetsURL = options.assetsURL || '';

    this.drawBoard = function () {
        console.log('drawBoard');
    };
    assetsURL: options.assetsURL || '';

    var renderer;
    var scene;
    var camera;
    var cameraController;
};



this.drawBoard = function () {
    initEngine();
}
initObjects(function () {
        onAnimationFrame();
    });

function initEngine() {
    var viewWidth = containerEl.offsetWidth;
    var viewHeight = containerEl.offsetHeight;

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setSize(viewWidth, viewHeight);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(35, viewWidth / viewHeight, 1, 1000);
    camera.position.set(0,120,150);
    cameraController = new THREE.OrbitControls(camera, containerEl);

    scene.add(camera);

    containerEl.appendChild(renderer.domElement);
}

function initObjects(callback) {
    var cube = new THREE.Mesh(new THREE.CubeGeometry(50, 50, 50));
    scene.add(cube);

    callback();
}

function onAnimationFrame() {
    requestAnimationFrame(onAnimationFrame);

    cameraController.update();
    
    renderer.render(scene, camera);
}