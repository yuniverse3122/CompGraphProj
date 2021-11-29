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

    function init() {
        boardController = new CHECKERS.BoardController({
            containerEl: options.containerEl,
            assetsUrl: options.assetsUrl
        });

        boardController.drawBoard(onBoardReady);
    }

    function onBoardReady() {
        var row, col, piece;

        for(row = 0; row < board.length; row++){
            for(col = 0; col < board[row].length; col++){
                if( (row +col )% 2){
                    if(row < 3){
                        piece = {
                            color: CHECKERS.BLACK,
                            pos: [row, col]
                        };
                    }else if(row > 4){
                        piece = {
                            color: CHECKERS.WHITE,
                            pos: [row, col]
                        };
                    }else{
                        piece = 0;
                    }
                }   

                board[row][col] = piece;

                if(piece){
                    boardController.addPiece(piece);
                }
            }
        }
    }

    init();
};