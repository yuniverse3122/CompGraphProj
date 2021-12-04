CHECKERS.Board = function (options) {
    options = options;
    var instance = this;
    var containerEl = options.containerEl || null;
    var assetsUrl = options.assetsUrl || '';
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
    var renderer;
    var projector;
    var scene;
    var camera;
    var cameraController;
    var materials = {};
    var pieceGeometry = null;
    var boardModel;
    var tileSize = 10;
    var selectedPiece = null;
    var callbacks = options.callbacks || {};




    this.drawBoard = function (callback) {
        initEng();
        
        initObjects(function () {
            onAnimationFrame();
            callback();
        });

        initListeners();
    };




    // used by game.js to add all the pieces from the internal board to the 3d board
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

        // create and orient shadow texture under piece
        var shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(tileSize, tileSize, 1, 1), materials.pieceShadow);
        shadowPlane.rotation.x = -90 * Math.PI / 180;
        shadowPlane.position.y -= 0.5;
    
        // add the mesh and shadow to this 3d object
        pieceObjGroup.add(pieceMesh);
        pieceObjGroup.add(shadowPlane);
    
        pieceObjGroup.position = boardCoordsTo3D(piece.pos);
    
        // place the 3d piece on the board
        board[ piece.pos[0] ][ piece.pos[1] ] = pieceObjGroup;
        scene.add(pieceObjGroup);
    };




    // remove a piece from the scene and delete it from the internal board
    this.removePiece = function (row, col) {
        if (board[row][col]) {
            scene.remove(board[row][col]);
        }
    
        board[row][col] = 0;
    };
    



    // move a piece, this function is only called if the move has been deemed valid
    this.movePiece = function (from, to) {
        var piece = board[ from[0] ][ from[1] ];
        var capturedPiece = board[ to[0] ][ to[1] ];
        var to3Dpos = boardCoordsTo3D(to);
    
        // update internal game board
        board[ from[0] ][ from[1] ] = 0;
        delete board[ to[0] ][ to[1] ];
        board[ to[0] ][ to[1] ] = piece;
    
        // capture piece
        if (capturedPiece !== 0) {
            scene.remove(capturedPiece);
        }
    
        // change the pieces position on the scene to match the selected spot
        piece.position.x = to3Dpos.x;
        piece.position.z = to3Dpos.z;
    
        piece.children[0].position.y = 0;
    };




    function initEng() {
        // set up all the things that allow the user to interact with the scene
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
        camera.position.set(tileSize * 4,120,250);
        cameraController = new THREE.OrbitControls(camera, containerEl);
        cameraController.center = new THREE.Vector3(tileSize * 4, 0, tileSize * 4);

        // add the camera so we can actually see the scene
        scene.add(camera);
    
        containerEl.appendChild(renderer.domElement);
    }
    



    function initObjects(callback) {

        // Creating all the materials that get called multiple times so we dont have to keep creating them

        // dark tile material
        materials.darktileMaterial = new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture(assetsUrl + 'dark_marble_tile.jpg')
        });
        
        // light tile material
        materials.lighttileMaterial = new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture(assetsUrl + 'light_marble_tile.jpg')
        });
    
        // white piece material
        materials.whitePieceMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff } );
    
        // black piece material
        materials.blackPieceMaterial = new THREE.MeshLambertMaterial( { color: 0x242424, shininess: 5 } );
    
        // material for selected piece
        materials.selectedPieceMaterial = new THREE.MeshLambertMaterial({color: 0x00FF00});

        // shadow that goes under the piece
        materials.pieceShadow = new THREE.MeshBasicMaterial({
            transparent: true,
            map: THREE.ImageUtils.loadTexture(assetsUrl + 'checkersPieceShadow.png')
        });


        // create and add the board model
        boardModel = new THREE.Mesh(
            new THREE.CubeGeometry(tileSize * 8 + 8, tileSize * 8 + 8, 1),
            new THREE.MeshBasicMaterial({color: 0x000000})
        );
        boardModel.rotation.x = -90 * Math.PI / 180;
        boardModel.position.y = -.55;
        boardModel.position.x = tileSize * 4;
        boardModel.position.z = tileSize * 4;
        scene.add(boardModel);

        // create the geometry for the pieces
        const geometry2 = new THREE.CylinderGeometry(4,4,1, 100, 100);
        pieceGeometry = geometry2;
        

        // create the board tiles
        var tileMaterial;
        for (var row = 0; row < 8; row++) {
            for (var col = 0; col < 8; col++) {
                if ((row + col) % 2 === 0) {
                    tileMaterial = materials.lighttileMaterial;
                } else {
                    tileMaterial = materials.darktileMaterial;
                }

                // create, position, and orient the tiles on the board
                var tile = new THREE.Mesh(new THREE.PlaneGeometry(tileSize, tileSize, 1, 1), tileMaterial);
                tile.position.x = col * tileSize + tileSize / 2;
                tile.position.z = row * tileSize + tileSize / 2;
                tile.position.y = -0.01;
                tile.rotation.x = -90 * Math.PI / 180;
                // make the tiles have random orientation so they dont all look the same
                var random = Math.random();
                if(random < .25){
                    tile.rotation.z = 90 * Math.PI / 180;
                }else if(.25 <= random < .50){
                    tile.rotation.z = 180 * Math.PI / 180;
                }else if(.50 <= random < .75){
                    tile.rotation.z = 270 * Math.PI / 180;
                }

                scene.add(tile);
            }
        }

        // Load Car Object and add to scene
        var loader = new THREE.OBJMTLLoader();
        loader.addEventListener ('load', function (event) {
            　　var object = event.content;
                object.scale.set(3,3,3);
            　  object.position.y = -70;
                object.position.x = 1021;
                object.position.z = -770;
                scene.add (object);
            　　});
        loader.load('assets/newCar.obj','assets/newCar.mtl', {side: THREE.Backside});

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

        // Add Sun and Sunlight
        const sunTexture = new THREE.ImageUtils.loadTexture('assets/2k_sun.jpg');
        const sun = new THREE.Mesh(
            new THREE.SphereGeometry(20, 32, 32),
            new THREE.MeshBasicMaterial({
                map: sunTexture
            })
        );
        sun.position.x = tileSize * 10 + 20;
        sun.position.y = 45;
        sun.position.z = tileSize * 18 + 10;

        scene.add(sun);

        const pointLight = new THREE.PointLight(0xffffff);
        pointLight.intensity = 2.5;
        pointLight.position.set(tileSize * 10 + 20,45,tileSize * 18 + 10);
        
        scene.add(pointLight);

        // Add moon
        const moonTexture = new THREE.ImageUtils.loadTexture('assets/2k_moon.jpg');
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

        callback();
    }




    // create listeners so the site knows when the user is trying to interact
    function initListeners() {
        var domElement = renderer.domElement;
    
        domElement.addEventListener('mousedown', onMouseDown, false);
        domElement.addEventListener('mouseup', onMouseUp, false);
    }




    // do the animation
    function onAnimationFrame() {
        requestAnimationFrame(onAnimationFrame);
    
        cameraController.update();
        
        renderer.render(scene, camera);
    }




    // when the mouse is pressed, check if the user is hovering over the board
    function onMouseDown(event) {
        var mouse3D = getMouse3D(event);
    
        // if the user is hovering over the board, dont let them manipulate the camera -- this is so they can move a piece
        if (isMouseOnBoard(mouse3D)) {
            if (isMouseOnPiece(mouse3D)) {
                selectPiece(mouse3D);
                renderer.domElement.addEventListener('mousemove', onMouseMove, false);
            }
            cameraController.userRotate = false;
        }
    }
    



    function onMouseUp(event) {
        renderer.domElement.removeEventListener('mousemove', onMouseMove, false);
    
        // check where the mouse is hovering
        var mouse3D = getMouse3D(event);
    
        // if the user has piece in their hand, check if the move they are trying to make is valid
        if (isMouseOnBoard(mouse3D) && selectedPiece) {
            var toBoardPos = threeDtoBoardCoords(mouse3D);
    
            // user is just putting the piece in its original position
            if (toBoardPos[0] === selectedPiece.boardPos[0] && toBoardPos[1] === selectedPiece.boardPos[1]) {
                deselectPiece();
            } else {
                // Check if this is a valid move
                if (callbacks.validMove && callbacks.validMove(selectedPiece.boardPos, toBoardPos, selectedPiece.obj.color, selectedPiece.obj.king)) {
                    instance.movePiece(selectedPiece.boardPos, toBoardPos);
                    selectedPiece.obj.getObjectByName("pieceMesh").material = selectedPiece.origMat;
                    
                    // if the user's piece is now at the other end of the board, make this piece a king
                    if (callbacks.pieceMoved) {
                        callbacks.pieceMoved(selectedPiece.boardPos, toBoardPos, selectedPiece.obj.color);
                        if(selectedPiece.obj.color === CHECKERS.WHITE && toBoardPos[0] == 0 && !selectedPiece.obj.king){
                            console.log("KING");
                            selectedPiece.obj.king = true;
                            selectedPiece.obj.getObjectByName("pieceMesh").scale.set(1,4,1);
                        }
                        if(selectedPiece.obj.color === CHECKERS.BLACK && toBoardPos[0] == 7 && !selectedPiece.obj.king){
                            console.log("KING");
                            selectedPiece.obj.king = true;
                            selectedPiece.obj.getObjectByName("pieceMesh").scale.set(1,4,1);
                        }
                    }

                    // rotate camera to indicate it is the other player's turn
                    rotateCamera();
    
                    // unselect the piece
                    selectedPiece = null;
                } else {
                    // if the move is not valid return it to it's original spot
                    deselectPiece();
                }
            }
        } else {
            deselectPiece();
        }
    
        // a piece is no longer selected so we can allow the user to rotate the camera again
        cameraController.userRotate = true;
    }
    



    // find the position of a board piece in 3d space
    function boardCoordsTo3D (pos) {
        var x = (1 + pos[1]) * tileSize - tileSize / 2;
        var z = (1 + pos[0]) * tileSize - tileSize / 2;
    
        return new THREE.Vector3(x, .5, z);
    }    




    // find the 2d board coordinates that a board piece is over
    function threeDtoBoardCoords(pos) {
        var i = 8 - Math.ceil((tileSize * 8 - pos.z) / tileSize);
        var j = Math.ceil(pos.x / tileSize) - 1;
    
        if (i > 7 || i < 0 || j > 7 || j < 0 || isNaN(i) || isNaN(j)) {
            return false;
        }
    
        return [i, j];
    }




    // checks where the mouse is hovering over
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




    // returns true if the mouse is hovering over the board
    function isMouseOnBoard(pos) {
        if (pos.x >= 0 && pos.x <= tileSize * 8 && pos.z >= 0 && pos.z <= tileSize * 8) {
            return true;
        } else {
            return false;
        }
    }




    // returns true if the mouse is hovering over a piece
    function isMouseOnPiece(pos) {
        var boardPos = threeDtoBoardCoords(pos);
    
        if (boardPos && board[ boardPos[0] ][ boardPos[1] ] !== 0) {
            return true;
        }
    
        return false;
    }




    // select the piece the user is hovering over
    function selectPiece(pos) {
        var boardPos = threeDtoBoardCoords(pos);
    
        // if the user clicks a place with no pieces, do nothing
        if (board[ boardPos[0] ][ boardPos[1] ] === 0) {
            selectedPiece = null;
            return false;
        }
    
        // save the board position in case the user does not move the piece properly
        selectedPiece = {};
        selectedPiece.boardPos = boardPos;
        selectedPiece.obj = board[ boardPos[0] ][ boardPos[1] ];
        if(selectedPiece.obj.king){
            console.log("this is a king piece");
        }
        selectedPiece.origPos = selectedPiece.obj.position.clone();
        
        // change the material to indicate this piece is selected. Save the previous material to revert to after the move.
        selectedPiece.origMat = selectedPiece.obj.getObjectByName("pieceMesh").material.clone();   
        selectedPiece.obj.getObjectByName("pieceMesh").material = materials.selectedPieceMaterial;
        
        return true;
    }




    function deselectPiece() {
        // if no piece is selected then this function was just called as a fail safe, return
        if (!selectedPiece) {
            return;
        }
    
        // return the piece to its original position and material
        selectedPiece.obj.position = selectedPiece.origPos;
        selectedPiece.obj.children[0].position.y = 0;
        selectedPiece.obj.getObjectByName("pieceMesh").material = selectedPiece.origMat;
    
        selectedPiece = null;
    }




    function onMouseMove(event) {
        var mouse3D = getMouse3D(event);
    
        // if a piece is selected, make it stick to the mouse cursor
        if (selectedPiece) {
            selectedPiece.obj.position.x = mouse3D.x;
            selectedPiece.obj.position.z = mouse3D.z;
    
            // raise the piece to indicate it is picked up
            selectedPiece.obj.children[0].position.y = 0.75;
        }
    }




    // funcion to rotate camera 180 degrees or pi radians
    // this function is used every time a player makes a move
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






