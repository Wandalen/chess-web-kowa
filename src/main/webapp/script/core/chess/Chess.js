Chess = function() {
  arguments.callee.prototype.init.apply( this,arguments );
};

(function(){

// -- var
var Self = Chess;

//

var init = function( options ) {

  var self = this;
  options = options || {};
  Gutils.mapExtend( self,options );

  if( !self.scene ) throw 'chess/Chess.js: No scene';

  if( !self.tween ) self.tween = {};
  if( !self.tween.chess ) self.tween.chess = {};
  if( !self.tween.easing ) self.tween.easing = TWEEN.Easing.Exponential.InOut;

  if( !self.boardSize ) self.boardSize = [100,100];
  if( !self.cellNumber ) self.cellNumber = [8,8];

  if( self.transition === undefined ) self.transition = true;
  if( self.duration === undefined ) self.duration = 500;

  self.cellSize = [self.boardSize[0]/self.cellNumber[0],self.boardSize[0]/self.cellNumber[0]];
  self.cellOffset = [ - self.boardSize[0]/2 + self.cellSize[0]/2, - self.boardSize[1]/2 + self.cellSize[1]/2];

  if( !self.cells ) self.initBoard();
  if( !self.player ) self.initPlayers();

}

//

var initPlayers = function() {

  var self = this;

  var playerWhiteOptions =
  {
    chess: self,
    id: 'White',
    color: 0xffffff,
    map: self.map[0],
    bumpMap: self.bumpMap[0],
    orbital: { x:+0 }
  }

  var playerBlackOptions =
  {
    chess: self,
    id: 'Black',
    color: 0x333333,
    map: self.map[1],
    bumpMap: self.bumpMap[1],
    orbital: { x:180 }
  }

  if( !self.player ) self.player = {};
  self.player.white = new ChessPlayer( playerWhiteOptions );
  self.player.black = new ChessPlayer( playerBlackOptions );

}

//

var initBoard = function() {

  var self = this;

  // map

  if( self.map )
  {
    if( !Gutils.arrayIs( self.map ) ) self.map = [self.map,self.map];
  }
  if( self.bumpMap )
  {
    if( !Gutils.arrayIs( self.bumpMap ) ) self.bumpMap = [self.bumpMap,self.bumpMap];
  }

  // parameter

  var parameters = {
    ambient: 0x000000,
    color: 0xffffff,
    specular: 0x222222,
    shiness: 1,
    bumpScale: 5
  };

  // white material

  if( self.map ) parameters.map = self.map[0];
  if( self.bumpMap ) parameters.bumpMap = self.bumpMap[0];
  var materialWhite = new THREE.MeshPhongMaterial( parameters );

  // black material

  if( self.map ) parameters.map = self.map[1];
  if( self.bumpMap ) parameters.bumpMap = self.bumpMap[1];
  parameters.color = 0x333333;
  var materialBlack = new THREE.MeshPhongMaterial( parameters );

  // cells

  var cell;
  var geometry = new THREE.PlaneGeometry( self.cellSize[0],self.cellSize[1] );
  var result = new THREE.Object3D();
  result.position.set( 0,0,0 );
  self.scene.add( result );

  if( !self.cell ) self.cell = {};

  var pos = [0,0];
  for( pos[0] = 0 ; pos[0] < self.cellNumber[0] ; pos[0]++ )
  for( pos[1] = 0 ; pos[1] < self.cellNumber[1] ; pos[1]++ )
  {
    var material = (pos[0]%2 === 1) ^ (pos[1]%2 === 1) ? materialWhite : materialBlack;
    material = material.clone();
    material.colorOriginal = material.color.clone();
    cell = new THREE.Mesh( geometry, material );

    cell.receiveShadow = true;

    self.worldPositionWithCellPosition( cell.position,pos );

    cell.rotation.x = -Math.PI / 2;

    cell.boardPosition = pos.slice();

    self.cell[self.codeWithCellPosition( pos )] = cell;

    result.add( cell );
  }

  return result;

}

// --

var applyValidOrigins = function( validMoves ) {

  var self = this;
  self.validMoves = validMoves;

  for( var c in self.cell )
  {
    var cell = self.cell[c];
    cell.material.color.b = cell.material.colorOriginal.b;
    cell.validOrigin = 0;
  }

  for( var m = 0 ; m < validMoves.length ; m++ )
  {
    var move = validMoves[m];
    var origin = self.cell[move['origin']];
    origin.material.color.b = 5;
    origin.validOrigin = true;
  }

}

//

var applyValidDestinations = function( origin ) {

  var self = this;
  var validMoves = self.validMoves;

  for( var c in self.cell )
  {
    var cell = self.cell[c];
    cell.material.color.g = cell.material.colorOriginal.g;
    cell.validDestination = 0;
  }

  for( var m = 0 ; m < validMoves.length ; m++ )
  {
    var move = validMoves[m];
    if( move['origin'] != origin ) continue;
    var destination = self.cell[move['destination']];
    destination.material.color.g = 2;
    destination.validDestination = true;
  }

}

//

var clearValidMoves = function() {

  var self = this;

  for( var c in self.cell )
  {
    var cell = self.cell[c];
    cell.material.color.copy( cell.material.colorOriginal );
    cell.validDestination = 0;
    cell.validOrigin = 0;
  }

}

//

var applyState = function( state ) {

  var self = this;

  for( var p in self.player )
  {
    var player = self.player[p];
    if( state['currentPlayer'] === player.id && self.currentPlayer != player )
    {
      if( !state.gameOver && !state.inCheck )
      {
        self.onMessage( player.id + ' player' );
      }
      self.currentPlayer = player;
      if( self.orbital )
      {
        if( self.transition ) self.orbital.transit( player.orbital );
      }
    }
  }

  if( !state.gameOver && state.inCheck )
  {
    self.onMessage( 'Check!',3000 );
  }

  if( state.gameOver )
  {
    self.onMessage( 'Checkmate!',100000 );
  }


  self.player.white.applyState( state.positionToPieces );
  self.player.black.applyState( state.positionToPieces );

}

// -- action

var unpickAll = function( code ) {

  var self = this;
  self.picked = null;

  for( var c in self.cell )
  {
    var cell = self.cell[c];
    if( !cell.chessman ) continue;
    cell.chessman.pick( false );
  }

}

//

var select = function( code ) {

  var self = this;

  if( self.move( code ) ) return;
  if( self.pick( code ) ) return;

}

//

var pick = function( code ) {

  var self = this;

  //console.log( 'pick',code );

  if( !code ) return;
  var cell = self.cell[code];
  if( !cell ) return;
  var chessman = cell.chessman;
  if( !chessman ) return;
  if( chessman.picked ) return;

  self.unpickAll()

  chessman.pick( true );

  self.picked = chessman;

  self.applyValidDestinations( code );

  return true;
}

//

var move = function( code ) {

  var self = this;

  //console.log( 'pick',code );

  if( !code ) return;
  var cell = self.cell[code];
  if( !cell ) return;
  if( !cell.validDestination ) return;
  if( !self.picked ) return;

  var codeWas = self.picked.positionCode;

  self.picked.move( code );

  self.clearValidMoves();

  var data =
  {
    "origin": codeWas,
    "destination": code
  }

  $.ajax({
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    type: 'POST',
    dataType: 'json',
    data: JSON.stringify( data ),
    url: '/api/chess/moves',
    success: function( response ) {

      //console.log( 'POST /api/chess/moves',response );
      self.refresh( response );

    }
  });

  return true;
}

//

var refresh = function( response ) {

  var self = this;

  if( response )
  {
    self.applyState( response );
  }
  else
  {
    $.ajax({
      type: 'GET',
      url: '/api/chess',
      success: function( response ) {

        //console.log( 'GET /api/chess',response );
        self.applyState( response );

      }
    });
  }

  //

  $.ajax({
    type: 'GET',
    url: '/api/chess/moves',
    success: function( response ) {

      //console.log( 'GET /api/chess/moves',response );
      self.applyValidOrigins( response );

    }
  });

}

//

var restart = function( code ) {

  var self = this;

  $.ajax({
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    type: 'POST',
    dataType: 'json',
    url: '/api/chess',
    success: function( response ) {

      //console.log( 'POST /api/chess',response );
      self.refresh( response );

    }
  });

  return true;
}

// -- position

var codeWithCellPosition = function( cellPosition ) {

  var result = String.fromCharCode( 'a'.charCodeAt( 0 ) + cellPosition[0] ) + ( cellPosition[1] + 1 );
  return result;

}

//

var cellPositionWithCode = function( result,code ) {

  //var result = [];
  var letter = code.replace( /[0-9.]/g, "" );
  var digit = code.replace( /[^0-9.]/g, "" );

  result[0] = letter.charCodeAt( 0 ) - 'a'.charCodeAt( 0 );
  result[1] = digit - 1;

  return result;

}

//

var worldPositionWithCellPosition = function( worldPosition,cellPosition ) {

  worldPosition[0] = + ( cellPosition[0]*this.cellSize[0] + this.cellOffset[0] );
  worldPosition[1] = 0;
  worldPosition[2] = - ( cellPosition[1]*this.cellSize[1] + this.cellOffset[1] );

}

//

var worldPositionWithCode = function( worldPosition,code ) {

  var cellPosition = this.cellPositionWithCode( code );
  this.worldPositionWithCellPosition( worldPosition,cellPosition );

}

//

var typeWithCode = function( result,code ) {

  //var result = {};
  var letter = code.replace( /[0-9.]/g, "" );
  var digit = code.replace( /[^0-9.]/g, "" );

  if( !digit ) digit = 1;
  result.number = digit;
  result.type = letter;
  result.code = letter + digit;

  return result;

}

//

var onMessage = function( msg ) {
}

//

Self.prototype = {

  // -- constructor
  init: init,
  initPlayers: initPlayers,
  initBoard: initBoard,

  // -- state
  applyValidOrigins: applyValidOrigins,
  applyValidDestinations: applyValidDestinations,
  clearValidMoves: clearValidMoves,
  applyState: applyState,

  // -- action
  unpickAll: unpickAll,
  select: select,
  pick: pick,
  move: move,
  refresh: refresh,
  restart: restart,

  // -- conversion
  codeWithCellPosition: codeWithCellPosition,
  cellPositionWithCode: cellPositionWithCode,
  worldPositionWithCellPosition: worldPositionWithCellPosition,
  worldPositionWithCode: worldPositionWithCode,
  typeWithCode: typeWithCode,

  // -- handler
  onMessage: onMessage

}

})();