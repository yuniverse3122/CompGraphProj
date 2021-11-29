CHECKERS.BoardController = function (options) {
    'use strict';

    options = options || {};

    var containerEl = options.containerEl || null;

    var assetsUrl = options.assetsUrl || '';

    var renderer;
    var scene;
    var camera;
    var cameraController;

    var lights = {};
    var materials = {};

    var pieceGeometry = null;
    var boardModel;
    var groundModel;

    var squareSize = 10;


    this.drawBoard = function (callback) {
        initEngine();
        initLights();
        initMaterials();

        initObjects(function () {
            onAnimationFrame();

            callback();
        });
    };

    function initEngine() {
        var viewWidth = containerEl.offsetWidth;
        var viewHeight = containerEl.offsetHeight;
    
        renderer = new THREE.WebGLRenderer({
            antialias: true
            //alpha:true
        });
    
        renderer.setSize(viewWidth, viewHeight);
        //renderer.setClearColor(0xff0000,0);
        scene = new THREE.Scene();
    
        camera = new THREE.PerspectiveCamera(35, viewWidth / viewHeight, 1, 1000);
        camera.position.set(0,120,150);
        cameraController = new THREE.OrbitControls(camera, containerEl);
        cameraController.center = new THREE.Vector3(squareSize * 4, 0, squareSize * 4);

        scene.add(camera);
    
        containerEl.appendChild(renderer.domElement);
    }

    function initObjects(callback) {
        var loader = new THREE.JSONLoader();
        var totalObjectsToLoad = 2; // board + the piece
        var loadedObjects = 0; // count the loaded pieces
        
        // checks if all the objects have been loaded
        function checkLoad() {
            loadedObjects++;
        
            if (loadedObjects === totalObjectsToLoad && callback) {
                callback();
            }
        }
        
            // load board
        loader.load(assetsUrl + 'board.js', function (geom) {
            boardModel = new THREE.Mesh(geom, materials.boardMaterial);
        
            scene.add(boardModel);
        
            checkLoad();
        });
        
            // load piece
        loader.load(assetsUrl + 'piece.js', function (geometry) {
            pieceGeometry = geometry;
        
            checkLoad();
        });
        
        scene.add(new THREE.AxisHelper(200));    
    }
    
    function initLights() {
        // top light
        lights.topLight = new THREE.PointLight();
        lights.topLight.position.set(0, 150, 0);
        lights.topLight.intensity = 1.0;
    
        // add the lights in the scene
        scene.add(lights.topLight);
    }
    
    function initMaterials() {
        // board material
        materials.boardMaterial = new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture(assetsUrl + 'board_texture.jpg')
        });
    
        // ground material
        materials.groundMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            map: THREE.ImageUtils.loadTexture(assetsUrl + 'ground.png')
        });
    
        // dark square material
        materials.darkSquareMaterial = new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture(assetsUrl + 'square_dark_texture.jpg')
        });
        //
        // light square material
        materials.lightSquareMaterial = new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture(assetsUrl + 'square_light_texture.jpg')
        });
    
        // white piece material
        materials.whitePieceMaterial = new THREE.MeshPhongMaterial({
            color: 0xe9e4bd,
            shininess: 20
        });
    
        // black piece material
        materials.blackPieceMaterial = new THREE.MeshPhongMaterial({
            color: 0x9f2200,
            shininess: 20
        });
    
        // pieces shadow plane material
        materials.pieceShadowPlane = new THREE.MeshBasicMaterial({
            transparent: true,
            map: THREE.ImageUtils.loadTexture(assetsUrl + 'piece_shadow.png')
        });
    }
    

    function onAnimationFrame() {
        requestAnimationFrame(onAnimationFrame);
    
        cameraController.update();
        
        renderer.render(scene, camera);
    }
    
};






