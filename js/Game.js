var CHECKERS = {
    WHITE: 1,
    BLACK: 2
};

CHECKERS.Game = function (options) {
    'use strict';

    options = options || {};

    var boardController = null;

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
        boardController = new CHECKERS.BoardController({
            containerEl: options.containerEl,
            assetsUrl: options.assetsUrl,
            callbacks: {
                pieceCanDrop: isMoveLegal,
                pieceDropped: pieceMoved
            }
        });

        boardController.drawBoard(onBoardReady);
    }

    function onBoardReady() {
        var row, col, piece;

        for(row = 0; row < board.length; row++){
            for(col = 0; col < board[row].length; col++){
                if (row < 3 && (row + col) % 2) { // black piece
	                piece = {
	                    color: CHECKERS.BLACK,
	                    pos: [row, col]
	                };
	            } else if (row > 4 && (row + col) % 2) { // white piece
	                piece = {
	                    color: CHECKERS.WHITE,
	                    pos: [row, col]
	                };
	            } else { // empty square
	                piece = 0;
	            }

                board[row][col] = piece;

                if(piece){
                    boardController.addPiece(piece);
                }
            }
        }
    }

    function isMoveLegal(from, to, color, king) {
        if (color !== colorTurn) {
            return false;
        }
    
        var fromRow = from[0];
        var fromCol = from[1];
        var toRow = to[0];
        var toCol = to[1];
    
        // a piece can only move to a spot with no other spots
        if (board[toRow][toCol] !== 0) { 
            return false;
        }

        if(king){
            console.log("I AM TRYING TO MOVE THIS DAMN PIECE");
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
            // checks for one square move in left or right direction
            if (toRow === fromRow + 1 && (toCol === fromCol - 1 || toCol === fromCol + 1)) {
                return true;
            }
    
            // checks for 2 squares move (jumping over a piece)
            if (toRow === fromRow + 2) {
                // left direction
                if (toCol === fromCol - 2 && board[fromRow + 1][fromCol - 1] !== 0 && board[fromRow + 1][fromCol - 1].color != color) {
                    return true;
                }
    
                // right direction
                if (toCol === fromCol + 2 && board[fromRow + 1][fromCol + 1] !== 0 && board[fromRow + 1][fromCol + 1].color != color) {
                    return true;
                }
            }
        } else if (color === CHECKERS.WHITE) {
            // checks for one square move in left or right direction
            if (toRow === fromRow - 1 && (toCol === fromCol - 1 || toCol === fromCol + 1)) {
                return true;
            }
    
            // checks for 2 squares move (jumping over a piece)
            if (toRow === fromRow - 2) {
                // left direction
                if (toCol === fromCol - 2 && board[fromRow - 1][fromCol - 1] !== 0 && board[fromRow - 1][fromCol - 1].color != color) {
                    return true;
                }
    
                // right direction
                if (toCol === fromCol + 2 && board[fromRow - 1][fromCol + 1] !== 0 && board[fromRow - 1][fromCol + 1].color != color) {
                    return true;
                }
            }
        }
    
        return false;
    }

    function pieceMoved(from, to, color) {
        var fromRow = from[0];
        var fromCol = from[1];
        var toRow = to[0];
        var toCol = to[1];
    
        board[toRow][toCol] = board[fromRow][fromCol];
    
        board[fromRow][fromCol] = 0;
    
        // capture jumped piece
        if (toRow === fromRow - 2) { // left direction
            if (toCol === fromCol - 2) {
                boardController.removePiece(fromRow - 1, fromCol - 1);
                board[fromRow - 1][fromCol - 1] = 0;
            } else {
                boardController.removePiece(fromRow - 1, fromCol + 1);
                board[fromRow - 1][fromCol + 1] = 0;
            }
        } else if (toRow === fromRow + 2) { // right direction
            if (toCol === fromCol + 2) {
                boardController.removePiece(fromRow + 1, fromCol + 1);
                board[fromRow + 1][fromCol + 1] = 0;
            } else {
                boardController.removePiece(fromRow + 1, fromCol - 1);
                board[fromRow + 1][fromCol - 1] = 0;
            }
        }

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
            // change turn
        if (color === CHECKERS.WHITE) {
            colorTurn = CHECKERS.BLACK;
        } else {
            colorTurn = CHECKERS.WHITE;
        }
    }

    init();
};