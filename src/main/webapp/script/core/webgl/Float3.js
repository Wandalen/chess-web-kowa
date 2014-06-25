
THREE.Float3 = function () {
  arguments.callee.prototype.init.apply( this,arguments );
};

//

(function(){

var Parent = THREE.Vector3;
var Self = THREE.Float3;
var ArrayType = Float32Array;
var dimensions = 3;

//

var init = function() {

  var self = this;

  if( arguments[0] instanceof self.ArrayType )
  {
    self.elements = arguments[0];
  }
  else
  {
    self.elements = new self.ArrayType( self.dimensions );
    self.set.apply( self,arguments );
  }

}

//

var clone = function () {

  return new THREE.Float3( this.x, this.y, this.z );

}

//

var setComponent = function( index,src ) {

  this.elements[index] = src;

}

//

var getComponent = function( index ) {

  return this.elements[index];

}

// -- prototype

var Proto = {

  // -- routine
  init: init,
  clone: clone,

  setComponent: setComponent,
  getComponent: getComponent,


  // -- var
  ArrayType: ArrayType,
  dimensions: dimensions,


}

//Self.prototype = Object.create( Parent.prototype );
Gutils.mapExtend( Self.prototype,Parent.prototype );
Gutils.mapExtend( Self.prototype,Proto );

// xyz

Object.defineProperty( Self.prototype, 'x', {
  set : function( src ){ this.setComponent( 0,src ); },
  get : function(){ return this.getComponent( 0 ); },
  enumerable : true,
});
Object.defineProperty( Self.prototype, 'y', {
  set : function( src ){ this.setComponent( 1,src ); },
  get : function(){ return this.getComponent( 1 ); },
  enumerable : true,
});
Object.defineProperty( Self.prototype, 'z', {
  set : function( src ){ this.setComponent( 2,src ); },
  get : function(){ return this.getComponent( 2 ); },
  enumerable : true,
});

// index

Object.defineProperty( Self.prototype, 0, {
  set : function( src ){ this.setComponent( 0,src ); },
  get : function(){ return this.getComponent( 0 ); },
  enumerable : false,
});
Object.defineProperty( Self.prototype, 1, {
  set : function( src ){ this.setComponent( 1,src ); },
  get : function(){ return this.getComponent( 1 ); },
  enumerable : false,
});
Object.defineProperty( Self.prototype, 2, {
  set : function( src ){ this.setComponent( 2,src ); },
  get : function(){ return this.getComponent( 2 ); },
  enumerable : false,
});

})();