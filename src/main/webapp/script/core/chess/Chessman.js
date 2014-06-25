Chessman = function() {
  arguments.callee.prototype.init.apply( this,arguments );
};

(function(){

// -- var
var Self = Chessman;

//

var init = function( options ) {

  var self = this;
  options = options || {};
  Gutils.mapExtend( self,options );

  if( !self.chess ) throw "chess/Chessman.js: No Chess object";
  if( !self.player ) throw "chess/Chessman.js: No Player object";

  if( self.code )
  {
    self.chess.typeWithCode( self,self.code );
  }

  if( !self.type ) self.type = 'k';
  if( !self.number ) self.number = 0;
  if( !self.code ) self.code = self.type + self.number;

  console.log( 'Chassman',self.code,'created' );

  self.position = new THREE.Vector2( -1,-1 );

  var model = self.player.model[self.type];
  if( !model ) throw "chess/Chessman.js: No model found for type " + self.type;

  self.object = model.clone();
  self.chess.scene.add( self.object );

}

//

/*
var positionWithCode = function( code ) {

  var self = this;

  self.object.visible = true;
  self.positionCode = code;
  self.chess.cellPositionWithCode( self.position,code );
  self.chess.worldPositionWithCellPosition( self.object.position,self.position );

}
*/

//

var move = function( code,instantly ) {

  var self = this;

  //if( code )
  //console.log( 'chessman',self.code,'moved from',self.positionCode,'to',code );

  self.object.visible = true;
  self.picked = false;

  self.positionCode = code;
  self.chess.cellPositionWithCode( self.position,code );
  if( instantly )
  {
    self.chess.worldPositionWithCellPosition( self.object.position,self.position );
  }

  var target = new THREE.Vector3();
  self.chess.worldPositionWithCellPosition( target,self.position );

  if( self.chess.tween.chess[self.code] ) self.chess.tween.chess[self.code].stop();
  self.chess.tween.chess[self.code] = new TWEEN.Tween( self.object.position )
    .easing( self.chess.tween.easing )
    .to( { x:target.x, y:target.y, z:target.z }, self.chess.duration )
    .start();

}

//

var pick = function( val,force ) {

  var self = this;

  if( self.picked == val ) return;
  if( ( !self.cell || !self.cell.validOrigin ) && !force ) return;

  console.log( 'chessman',self.code,'pick',val );
  self.picked = val;

  if( val )
  {
    if( self.chess.tween.chess[self.code] ) self.chess.tween.chess[self.code].stop();
    self.chess.tween.chess[self.code] = new TWEEN.Tween( self.object.position )
      .easing( self.chess.tween.easing )
      .to( { y:25 }, self.chess.duration )
      .onComplete( function(){

        //setTimeout( function(){
          //if( self.chess.tween.chess[self.code] ) self.chess.tween.chess[self.code].stop();
          self.chess.tween.chess[self.code] = new TWEEN.Tween( self.object.position )
            .easing( TWEEN.Easing.Sinusoidal.InOut )
            .yoyo( true )
            .repeat( 100000 )
            .to( { y:20 }, self.chess.duration )
            .start();
        //},10 );

      })
      .start();
  }
  else
  {
    //setTimeout( function(){

      if( self.chess.tween.chess[self.code] ) self.chess.tween.chess[self.code].stop();
      self.chess.tween.chess[self.code] = new TWEEN.Tween( self.object.position )
        .easing( self.chess.tween.easing )
        .to( { y:0 }, self.chess.duration )
        .start();

    //},10 );

  }

}

//

Self.prototype = {

  // -- constructor
  init: init,

  //positionWithCode: positionWithCode,
  move: move,
  pick: pick,



}

})();