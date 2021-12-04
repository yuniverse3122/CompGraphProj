CHECKERS.BoardController = function (options) {
    'use strict';

    options = options || {};

    var instance = this;

    var containerEl = options.containerEl || null;

    var assetsUrl = options.assetsUrl || '';

    var renderer;
    var projector;
    var scene;
    var camera;
    var cameraController;

    var lights = {};
    var materials = {};

    var pieceGeometry = null;
    var boardModel;

    var squareSize = 10;

    var board = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];

    var selectedPiece = null;

    var callbacks = options.callbacks || {};

    this.drawBoard = function (callback) {
        initEngine();
        initLights();
        initMaterials();
        
        initObjects(function () {
            onAnimationFrame();

            callback();
        });
        

        initListeners();
    };

    this.addPiece = function (piece) {
        var pieceMesh = new THREE.Mesh(pieceGeometry);
        var pieceObjGroup = new THREE.Object3D();
        pieceObjGroup.king = false;
        pieceMesh.name = "pieceMesh";
        if (piece.color === CHECKERS.WHITE) {
            pieceObjGroup.color = CHECKERS.WHITE;
            pieceMesh.material = materials.whitePieceMaterial;
        } else {
            pieceObjGroup.color = CHECKERS.BLACK;
            pieceMesh.material = materials.blackPieceMaterial;
        }
    
        // create shadow plane
        var shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(squareSize, squareSize, 1, 1), materials.pieceShadowPlane);
        shadowPlane.rotation.x = -90 * Math.PI / 180;
        shadowPlane.position.y -= 0.5;
    
        pieceObjGroup.add(pieceMesh);
        pieceObjGroup.add(shadowPlane);
    
        pieceObjGroup.position = boardToWorld(piece.pos);
    
        board[ piece.pos[0] ][ piece.pos[1] ] = pieceObjGroup;
    
        scene.add(pieceObjGroup);
    };

    this.removePiece = function (row, col) {
        if (board[row][col]) {
            scene.remove(board[row][col]);
        }
    
        board[row][col] = 0;
    };
    

    this.movePiece = function (from, to) {
        var piece = board[ from[0] ][ from[1] ];
        var capturedPiece = board[ to[0] ][ to[1] ];
        var toWorldPos = boardToWorld(to);
    
        // update internal board
        board[ from[0] ][ from[1] ] = 0;
        delete board[ to[0] ][ to[1] ];
        board[ to[0] ][ to[1] ] = piece;
    
        // capture piece
        if (capturedPiece !== 0) {
            scene.remove(capturedPiece);
        }
    
        // move piece
        piece.position.x = toWorldPos.x;
        piece.position.z = toWorldPos.z;
    
        piece.children[0].position.y = 0;
    };

    function initEngine() {
        var viewWidth = containerEl.offsetWidth;
        var viewHeight = containerEl.offsetHeight;
    
        renderer = new THREE.WebGLRenderer({
            antialias: true
            //alpha:true
        });
    
        renderer.setSize(viewWidth, viewHeight);
        projector = new THREE.Projector();

        scene = new THREE.Scene();
    
        camera = new THREE.PerspectiveCamera(45, viewWidth / viewHeight, 1, 1000);
        camera.position.set(squareSize * 4,120,250);
        cameraController = new THREE.OrbitControls(camera, containerEl);
        cameraController.center = new THREE.Vector3(squareSize * 4, 0, squareSize * 4);

        
        var loader = new THREE.OBJMTLLoader();
        loader.addEventListener ('load', function (event) {
            　　var object = event.content;
                object.scale.set(3,3,3);
            　  object.position.y = -70;
                object.position.x = 1021;
                object.position.z = -770;
                scene.add (object);
            　　});
        loader.load('3d_assets/newCar.obj','3d_assets/newCar.mtl', {side: THREE.Backside});
    

        // Add stars
        function addStar(){
            const geometry = new THREE.SphereGeometry(.5, 24, 24);
            const material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true});
            const star = new THREE.Mesh( geometry, material );
          
            const [x, y, z] = Array(3).fill().map(() => THREE.Math.randFloatSpread(200));
            
            star.position.set(x+50,y,z+50);
            
            scene.add(star);
        }
        
        Array(200).fill().forEach(addStar);

        // Add sun
        const sunTexture = new THREE.ImageUtils.loadTexture('3d_assets/2k_sun.jpg');
        //sunTexture.minFilter = THREE.LinearFilter;
        const sun = new THREE.Mesh(
        new THREE.SphereGeometry(20, 32, 32),
        new THREE.MeshBasicMaterial({
            map: sunTexture,
            //normalMap: normalTexture
        })
        );
        sun.position.x = squareSize * 10 + 20;
        sun.position.y = 45;
        sun.position.z = squareSize * 18 + 10;

        scene.add(sun);

        // Add moon
        const moonTexture = new THREE.ImageUtils.loadTexture('3d_assets/2k_moon.jpg');
        //sunTexture.minFilter = THREE.LinearFilter;
        const moon = new THREE.Mesh(
        new THREE.SphereGeometry(5, 32, 32),
        new THREE.MeshLambertMaterial({
            map: moonTexture,
            //normalMap: normalTexture
        })
        );
        moon.position.x = -10;
        moon.position.y = 45;
        moon.position.z = -60;

        scene.add(moon);

        scene.add(camera);
    
        containerEl.appendChild(renderer.domElement);
    }


    
    
    function initLights() {
        // top light
        //lights.topLight = new THREE.PointLight(0xFFFFFF, 1, 100000);
        //lights.topLight.position.set(squareSize * 4, 150, squareSize * 20);
        //lights.topLight.intensity = 1.0;

        const pointLight = new THREE.PointLight(0xffffff);
        pointLight.intensity = 2.5;
        pointLight.position.set(squareSize * 10 + 20,45,squareSize * 18 + 10);

        //const ambientLight = new THREE.AmbientLight(0xffffff);

        scene.add(pointLight /*, ambientLight*/);
    
        // add the lights in the scene
        //scene.add(lights.topLight);
    }
    
    function initMaterials() {
        
        // board material
        materials.boardMaterial = /*new THREE.MeshStandardMaterial( { color: 0x00c414 } );*/new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture(assetsUrl + 'board_texture.jpg')
        });
    
        // dark square material
        materials.darkSquareMaterial = new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture(assetsUrl + 'dark_marble_square.jpg')
        });
        
        // light square material
        materials.lightSquareMaterial = new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture(assetsUrl + 'light_marble_square.jpg')
        });
    
        // white piece material
        materials.whitePieceMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff } );
    
        // black piece material
        materials.blackPieceMaterial = new THREE.MeshLambertMaterial( { color: 0x242424, shininess: 5 } );
    
        materials.selectedPieceMaterial = new THREE.MeshLambertMaterial({color: 0x00FF00});

        // pieces shadow plane material
        materials.pieceShadowPlane = new THREE.MeshBasicMaterial({
            transparent: true,
            map: THREE.ImageUtils.loadTexture(assetsUrl + 'checkersPieceShadow.png')
        });
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
            boardModel.position.y = -0.02;

            scene.add(boardModel);
        
            checkLoad();
        }); 

        // load piece
        loader.load(assetsUrl + 'piece.js', function (geometry) {


            const geometry2 = new THREE.CylinderGeometry(4,4,1, 100, 100);

            pieceGeometry = geometry2;
        
            checkLoad();
        });

        // create the board squares
        var squareMaterial;
        //
        for (var row = 0; row < 8; row++) {
            for (var col = 0; col < 8; col++) {
                if ((row + col) % 2 === 0) { // light square
                    squareMaterial = materials.lightSquareMaterial;
                } else { // dark square
                    squareMaterial = materials.darkSquareMaterial;
                }

                var square = new THREE.Mesh(new THREE.PlaneGeometry(squareSize, squareSize, 1, 1), squareMaterial);

                square.position.x = col * squareSize + squareSize / 2;
                square.position.z = row * squareSize + squareSize / 2;
                square.position.y = -0.01;

                square.rotation.x = -90 * Math.PI / 180;

                var random = Math.random();
                if(random < .25){
                    square.rotation.z = 90 * Math.PI / 180;
                }else if(.25 <= random < .50){
                    square.rotation.z = 180 * Math.PI / 180;
                }else if(.50 <= random < .75){
                    square.rotation.z = 270 * Math.PI / 180;
                }

                scene.add(square);
            }
        }
    }

    function initListeners() {
        var domElement = renderer.domElement;
    
        domElement.addEventListener('mousedown', onMouseDown, false);
        domElement.addEventListener('mouseup', onMouseUp, false);
    }

    function onAnimationFrame() {
        requestAnimationFrame(onAnimationFrame);
    
        cameraController.update();
        
        renderer.render(scene, camera);
    }

    function onMouseDown(event) {
        var mouse3D = getMouse3D(event);
    
        if (isMouseOnBoard(mouse3D)) {
            if (isPieceOnMousePosition(mouse3D)) {
                selectPiece(mouse3D);
                renderer.domElement.addEventListener('mousemove', onMouseMove, false);
            }
        
            cameraController.userRotate = false;
        }
    }
    
    function onMouseUp(event) {
        renderer.domElement.removeEventListener('mousemove', onMouseMove, false);
    
        var mouse3D = getMouse3D(event);
    
        if (isMouseOnBoard(mouse3D) && selectedPiece) {
            var toBoardPos = worldToBoard(mouse3D);
    
            if (toBoardPos[0] === selectedPiece.boardPos[0] && toBoardPos[1] === selectedPiece.boardPos[1]) {
                deselectPiece();
            } else {
                if (callbacks.pieceCanDrop && callbacks.pieceCanDrop(selectedPiece.boardPos, toBoardPos, selectedPiece.obj.color, selectedPiece.obj.king)) {
                    instance.movePiece(selectedPiece.boardPos, toBoardPos);
                    selectedPiece.obj.getObjectByName("pieceMesh").material = selectedPiece.origMat;
                    console.log(toBoardPos[0]);
                    if(selectedPiece.obj.color === CHECKERS.WHITE && toBoardPos[0] == 0){
                        console.log("KING");
                        selectedPiece.obj.king = true;
                        selectedPiece.obj.getObjectByName("pieceMesh").scale.set(1,4,1);
                    }
                    if(selectedPiece.obj.color === CHECKERS.BLACK && toBoardPos[0] == 7){
                        console.log("KING");
                        selectedPiece.obj.king = true;
                        selectedPiece.obj.getObjectByName("pieceMesh").scale.set(1,4,1);
                    }
                    rotateCamera();
                    if (callbacks.pieceDropped) {
                        callbacks.pieceDropped(selectedPiece.boardPos, toBoardPos, selectedPiece.obj.color);
                    }
    
                    selectedPiece = null;
                } else {
                    deselectPiece();
                }
            }
        } else {
            deselectPiece();
        }
    
        cameraController.userRotate = true;
    }
    
    
    function boardToWorld (pos) {
        var x = (1 + pos[1]) * squareSize - squareSize / 2;
        var z = (1 + pos[0]) * squareSize - squareSize / 2;
    
        return new THREE.Vector3(x, .5, z);
    }    

    function worldToBoard(pos) {
        var i = 8 - Math.ceil((squareSize * 8 - pos.z) / squareSize);
        var j = Math.ceil(pos.x / squareSize) - 1;
    
        if (i > 7 || i < 0 || j > 7 || j < 0 || isNaN(i) || isNaN(j)) {
            return false;
        }
    
        return [i, j];
    }

    function getMouse3D(mouseEvent){
        var x, y;

        if(mouseEvent.offsetX !== undefined){
            x = mouseEvent.offsetX;
            y = mouseEvent.offsetY;
        }else{
            x = mouseEvent.layerX;
            y = mouseEvent.layerY;
        }

        var pos = new THREE.Vector3(0,0,0);
        var pMouse = new THREE.Vector3(
            (x/renderer.domElement.width) * 2 - 1,
            -(y/renderer.domElement.height) * 2 + 1, 
            1
        );

        projector.unprojectVector(pMouse, camera);

        var cam = camera.position;
        var m = pMouse.y / (pMouse.y - cam.y);

        pos.x = pMouse.x + ( cam.x - pMouse.x ) * m;
        pos.z = pMouse.z + ( cam.z - pMouse.z ) * m;
    
        return pos;
    }

    function isMouseOnBoard(pos) {
        if (pos.x >= 0 && pos.x <= squareSize * 8 &&
            pos.z >= 0 && pos.z <= squareSize * 8) {
            return true;
        } else {
            return false;
        }
    }

    function isPieceOnMousePosition(pos) {
        var boardPos = worldToBoard(pos);
    
        if (boardPos && board[ boardPos[0] ][ boardPos[1] ] !== 0) {
            return true;
        }
    
        return false;
    }

    function selectPiece(pos) {
        var boardPos = worldToBoard(pos);
    
        // check for piece presence
        if (board[ boardPos[0] ][ boardPos[1] ] === 0) {
            selectedPiece = null;
            return false;
        }
    
        selectedPiece = {};
        selectedPiece.boardPos = boardPos;
        selectedPiece.obj = board[ boardPos[0] ][ boardPos[1] ];
        if(selectedPiece.obj.king){
            console.log("this is a king piece");
        }
        selectedPiece.origPos = selectedPiece.obj.position.clone();
        
        selectedPiece.origMat = selectedPiece.obj.getObjectByName("pieceMesh").material.clone();   
        selectedPiece.obj.getObjectByName("pieceMesh").material = materials.selectedPieceMaterial;
        
    
        return true;
    }

    function deselectPiece() {
        if (!selectedPiece) {
            return;
        }
    
        selectedPiece.obj.position = selectedPiece.origPos;
        selectedPiece.obj.children[0].position.y = 0;
        selectedPiece.obj.getObjectByName("pieceMesh").material = selectedPiece.origMat;
    
        selectedPiece = null;
    }

    function onMouseMove(event) {
        var mouse3D = getMouse3D(event);
    
        // drag selected piece
        if (selectedPiece) {
            selectedPiece.obj.position.x = mouse3D.x;
            selectedPiece.obj.position.z = mouse3D.z;
    
            // lift piece
            
            selectedPiece.obj.children[0].position.y = 0.75;
        }
    }

    // funcion to rotate camera 180 degrees or pi radians
    async function rotateCamera() {
        var rotated = 0;
        
        while(rotated <= Math.PI){
            rotated += 2 * Math.PI / 60 / 60 * 12;
            cameraController.rotateLeft();
            // change the 5 below or the 12 above to change the speed of rotation
            await new Promise(r => setTimeout(r, 4));
        }        
    }
};






