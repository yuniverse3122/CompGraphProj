CHECKERS.BoardController = function (options) {
    'use strict';

    options = options || {};

    var containerEl = options.containerEl || null;

    var assetsUrl = options.assetsUrl || '';

<<<<<<< HEAD
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
=======
    assetsUrl: options.assetsUrl || '';

    var renderer;
    var scene;
    var camera;
    var cameraController;

    this.drawBoard = function () {
        initEngine();
        initObjects(function () {
            onAnimationFrame();
        });
    };
>>>>>>> 246a4fab67abf13e8a12b10ad16a420f8b8d14e1

    function initEngine() {
        var viewWidth = containerEl.offsetWidth;
        var viewHeight = containerEl.offsetHeight;
    
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha:true
        });
    
        renderer.setSize(viewWidth, viewHeight);
        renderer.setClearColor(0xff0000,0);
        scene = new THREE.Scene();
    
        camera = new THREE.PerspectiveCamera(35, viewWidth / viewHeight, 1, 1000);
        camera.position.set(0,120,150);
        cameraController = new THREE.OrbitControls(camera, containerEl);
    
        scene.add(camera);
    
        containerEl.appendChild(renderer.domElement);
    }

    function initObjects(callback) {
        const material = new THREE.MeshBasicMaterial({
            color: 0x00FF00,
            //wireframe: true,
          });


        const geometry = new THREE.CubeGeometry(50, 50, 50);
        const cube = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments( cube, new THREE.LineBasicMaterial({color: 0x0044ff}));
        //var cube = new THREE.CubeGeometry(50, 50, 50);
        
        scene.add(line);
    
        callback();
    }
    
    function onAnimationFrame() {
        requestAnimationFrame(onAnimationFrame);
    
        cameraController.update();
        
        renderer.render(scene, camera);
    }
    
};






