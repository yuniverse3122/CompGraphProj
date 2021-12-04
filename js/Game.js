var CHECKERS = {
    WHITE: 1,
    BLACK: 2
};

CHECKERS.Game = function (options) {
    options = options || {};
    var gameBoard = null;
    // internal board - used for game logic
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
    var colorTurn = CHECKERS.WHITE;




    function init() {
        gameBoard = new CHECKERS.Board({
            containerEl: options.containerEl,
            assetsUrl: options.assetsUrl,
            callbacks: {
                validMove: isMoveValid,
                pieceMoved: pieceMoved
            }
        });

        gameBoard.drawBoard(addPieces);
    }




    function addPieces() {
        var row, col, piece;

        for(row = 0; row < board.length; row++){
            for(col = 0; col < board[row].length; col++){
                // add the black pieces
                if (row < 3 && (row + col) % 2) { 
	                piece = {
	                    color: CHECKERS.BLACK,
	                    pos: [row, col]
	                };
                // add the white pieces
	            } else if (row > 4 && (row + col) % 2) {
	                piece = {
	                    color: CHECKERS.WHITE,
	                    pos: [row, col]
	                };
	            } else {
                    // empty spot on board
	                piece = 0;
	            }

                board[row][col] = piece;

                if(piece){
                    // put the 3d piece model on the board
                    gameBoard.addPiece(piece);
                }
            }
        }
    }




    function isMoveValid(from, to, color, king) {
        // only let the player whose turn it is move a piece
        if (color !== colorTurn) {
            return false;
        }
    
        var fromRow = from[0];
        var fromCol = from[1];
        var toRow = to[0];
        var toCol = to[1];
    
        // a piece can only move to a spot with no other pieces
        if (board[toRow][toCol] !== 0) { 
            return false;
        }

        if(king){
            // a king can move in any direction
            if ((toRow === fromRow + 1 || toRow === fromRow -1) && (toCol === fromCol - 1 || toCol === fromCol + 1)) {
                return true;
            }

            // if the player is trying to make a 2 space move, ensure it is a jump
            if (toRow === fromRow + 2 || toRow === fromRow - 2) {

                // When checking if a piece can be jumped, only check the possible moves.
                if(fromRow != 0 && fromCol != 0){
                    if (toCol === fromCol - 2 && board[fromRow - 1][fromCol - 1] !== 0 && board[fromRow - 1][fromCol - 1].color != color) {
                        return true;
                    }
                }
                if(fromRow != 0 && fromCol != 7){
                    if (toCol === fromCol + 2 && board[fromRow - 1][fromCol + 1] !== 0 && board[fromRow - 1][fromCol + 1].color != color) {
                        return true;
                    }
                }
                if(fromRow != 7 && fromCol != 0){
                    if (toCol === fromCol - 2 && board[fromRow + 1][fromCol - 1] !== 0 && board[fromRow + 1][fromCol - 1].color != color) {
                        return true;
                    }
                }
                if(fromRow != 7 && fromCol != 7){
                    if (toCol === fromCol + 2 && board[fromRow + 1][fromCol + 1] !== 0 && board[fromRow + 1][fromCol + 1].color != color) {
                        return true;
                    }
                }
            }
        } else if (color === CHECKERS.BLACK) {
            // player is trying to move one spot to the left or right
            if (toRow === fromRow + 1 && (toCol === fromCol - 1 || toCol === fromCol + 1)) {
                return true;
            }
    
            // player is trying to jump a piece
            if (toRow === fromRow + 2) {
                if (toCol === fromCol - 2 && board[fromRow + 1][fromCol - 1] !== 0 && board[fromRow + 1][fromCol - 1].color != color) {
                    return true;
                }
                if (toCol === fromCol + 2 && board[fromRow + 1][fromCol + 1] !== 0 && board[fromRow + 1][fromCol + 1].color != color) {
                    return true;
                }
            }
        } else if (color === CHECKERS.WHITE) {
            if (toRow === fromRow - 1 && (toCol === fromCol - 1 || toCol === fromCol + 1)) {
                return true;
            }
            if (toRow === fromRow - 2) {
                if (toCol === fromCol - 2 && board[fromRow - 1][fromCol - 1] !== 0 && board[fromRow - 1][fromCol - 1].color != color) {
                    return true;
                }
                if (toCol === fromCol + 2 && board[fromRow - 1][fromCol + 1] !== 0 && board[fromRow - 1][fromCol + 1].color != color) {
                    return true;
                }
            }
        }
        // if none of the if statements return true, this move is not valid
        return false;
    }




    function pieceMoved(from, to, color) {
        var fromRow = from[0];
        var fromCol = from[1];
        var toRow = to[0];
        var toCol = to[1];
    
        // move the piece in the board array
        board[toRow][toCol] = board[fromRow][fromCol];
    
        // set the old spot as empty
        board[fromRow][fromCol] = 0;
    
        // if they moved over two rows, it was a jump and the captured piece must be removed
        if (toRow === fromRow - 2) {
            if (toCol === fromCol - 2) {
                gameBoard.removePiece(fromRow - 1, fromCol - 1);
                board[fromRow - 1][fromCol - 1] = 0;
            } else {
                gameBoard.removePiece(fromRow - 1, fromCol + 1);
                board[fromRow - 1][fromCol + 1] = 0;
            }
        } else if (toRow === fromRow + 2) {
            if (toCol === fromCol + 2) {
                gameBoard.removePiece(fromRow + 1, fromCol + 1);
                board[fromRow + 1][fromCol + 1] = 0;
            } else {
                gameBoard.removePiece(fromRow + 1, fromCol - 1);
                board[fromRow + 1][fromCol - 1] = 0;
            }
        }

        // Check if either side has no pieces left
        // If one side has no pieces left, the other side wins
        var whiteCt = 0;
        var blackCt = 0;
        for(let row = 0; row < 8; row++){
            for(let col = 0; col < 8; col++){
                if(board[row][col].color == CHECKERS.WHITE)
                    whiteCt++;
                if(board[row][col].color == CHECKERS.BLACK)
                    blackCt++;
            }
        }
        if(whiteCt == 0){
            console.log("Black Wins!");
            pop.open("Black Wins!!", "congrats");
        }
        if(blackCt == 0){
            console.log("White Wins!")
            pop.open("White Wins!!", "congrats");
        }
        
        // switch whose turn it is after moving
        if (color === CHECKERS.WHITE) {
            colorTurn = CHECKERS.BLACK;
        } else {
            colorTurn = CHECKERS.WHITE;
        }
    }

    // start the game
    init();
};