var CHECKERS = {};

CHECKERS.Game = function (options) {
    'use strict';

    options = options || {};

    var boardController = null;


    function init() {
        boardController = new CHECKERS.BoardController({
            containerEl: options.containerEl,
            assetsUrl: options.assetsUrl
        });

        boardController.drawBoard();
    }



    init();
};