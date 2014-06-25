ControlOrbital = function ( options ) {
  this.init( options );
};

(function(){

var $ = jQuery;

var mouse =
{
  pos: new THREE.Vector2( 0,0 ),
  anchor: new THREE.Vector2( 0,0 ),
  down: false
};

var position = new THREE.Vector3( 0,0,0 );
var low = new THREE.Vector3( -360,0,150 );
var high = new THREE.Vector3( 360,89,250 );
var initial = new THREE.Vector3( 0.1,0,0 );
var moment = new THREE.Vector3( 0.1,0,0 );
var orbital = new THREE.Vector3( 0,5,175 );
var target = new THREE.Vector3( 0,5,175 );
var sensetivity = new THREE.Vector3( 200,30,0.03 );

//

var axis1 = new THREE.Vector3( 0,1,0 );
var axis2 = new THREE.Vector3( 1,0,0 );
var rotate = new THREE.Vector2( 0,0 );

var quaternion = new THREE.Quaternion();
var quaternion0 = new THREE.Quaternion();
var quaternion1 = new THREE.Quaternion();
var quaternion2 = new THREE.Quaternion();

//

var animateState = 0;
var stopCounter = 0;
var stopDelay = 10;
var speed = 0.1;
var attraction = 0;
var damping = 0.05;

// -- parameter

var surfacePath = 'body';
var surface = null;
var camera = null;
var scene = null;
var arg = null;

// -- routine

var init = function( options ) {
  var self = this;
  options = options || {};
  Gutils.mapExtend( self,options );

  self.low = self.low.clone();
  self.high = self.high.clone();
  self.initial = self.initial.clone();
  self.moment = self.moment.clone();
  self.orbital = self.orbital.clone();
  self.target = self.target.clone();
  self.sensetivity = self.sensetivity.clone();
  self.axis1 = self.axis1.clone();
  self.axis2 = self.axis2.clone();
  self.rotate = self.rotate.clone();
  self.quaternion = self.quaternion.clone();
  self.quaternion0 = self.quaternion0.clone();
  self.quaternion1 = self.quaternion1.clone();
  self.quaternion2 = self.quaternion2.clone();

  // tween

  self.tween = {};
  self.tween.easing = TWEEN.Easing.Sinusoidal.InOut;
  self.tween.duration = 750;

  //

  if( this.surfacePath ) this.surface = $( this.surfacePath );
  if( !this.surface.length ) throw 'ControlOrbital: no surface found';

  var size = [this.surface.width(),this.surface.height()];
  self.mouse = Gutils.clone( self.mouse );
  self.mouse.pos.set( size[0]/2,size[1]/2 )

  $( 'body' )
  .mouseup(function( event ) {
    self.handleMouseUp( event,this );
  })

  self.surface
  .mousemove(function( event ) {
    self.handleMouseMove( event,this );
  })
  .mousedown(function( event ) {
    self.handleMouseDown( event,this );
  })
  //.bind( 'mousewheel DOMMouseScroll', function( event ) {
  .mousewheel(function( event ) {
    self.handleWheel( event,this );
  });

/*
  this.surface.addEventListener( "mousemove", function( event ){ self.handleMouseMove( event,this ) }, false );
  this.surface.addEventListener( "mouseup", function( event ){ self.handleMouseUp( event,this ) }, false );
  this.surface.addEventListener( "mousedown", function( event ){ self.handleMouseDown( event,this ) }, false );
  this.surface.addEventListener( "mousewheel", function( event ){ self.handleWheelChrome( event,this ) }, false );
  this.surface.addEventListener( "DOMMouseScroll", function( event ){ self.handleWheelMoz( event,this ) }, false );
*/
}

//

var getOrbitalWithMatrix = function( matrix ) {

  var self = this;
  var result = new THREE.Vector3();
  var position = new THREE.Vector3();
  var rotation = new THREE.Euler();
  position.setFromMatrixPosition( matrix );
  rotation.setFromRotationMatrix( matrix );

  result.x = -(rotation.y)*180/Math.PI;
  result.y = -(rotation.x)*180/Math.PI;
  if( result.y > 90 )
  {
    result.y = 180 - result.y;
    result.x += 180;
  }
  if( result.x > 180 ) result.x -= 360;
  result.z = position.length();

  //console.log( 'orbital: ',Gutils.toStr( result ) );
  //console.log( 'rotation: ', Gutils.toStr( rotation ) );

  self.bound( result );
  return result;

}

//

var bound = function ( dst )
{
  if( !dst ) dst = this.orbital;
  //console.log( dst );
  dst.x = dst.x % 360;
  dst.x = THREE.Math.clamp( dst.x,this.low.x,this.high.x );
  dst.y = THREE.Math.clamp( dst.y,this.low.y,this.high.y );
  dst.z = THREE.Math.clamp( dst.z,this.low.z,this.high.z );
  //console.log( dst );
  //console.log( '' );
}

//

var zoom = function( delta ) {
  if( !this.animateState )
  {
    this.target.z = this.orbital.z;
  }
  else
  {
    var d = this.target.z - this.orbital.z;
    if( Gutils.sign( d ) == Gutils.sign( delta ) )
    this.target.z += d*2;
  }
  this.target.z -= 2 * delta * this.sensetivity.z * this.target.z;
  this.target.z = THREE.Math.clamp( this.target.z,this.low.z,this.high.z );
  this.animate();
}

//

var animate = function() {

  var self = this;
  this.animateState = 1;
  var d = this.target.z - this.orbital.z;
  this.orbital.z += ( d ) / 8;
  if( Math.abs( d ) / this.target.z < 0.001 )
  {
    this.orbital.z = this.target.z;
    this.animateState = 0;
    return;
  }

  setTimeout( function(){
    self.animate();
  },25);

}
//

var setRotation = function ( mode ) {
  if( mode ) this.moment.copy( this.initial );
  else this.moment = new THREE.Vector3( 0,0,0 );
}

//

var toggleRotation = function () {
  this.setRotation( this.moment.length()==0 );
}

//

var transit = function( rotation,position,duration ) {

  var self = this;
  if( duration === undefined ) duration = self.tween.duration;

  if( rotation )
  {
    if( self.tween.rotation ) self.tween.rotation.stop();

    if( rotation.x )
    {
      self.orbital.x = self.orbital.x % 360;
      if( rotation.x - self.orbital.x > +180 ) rotation.x -= 360;
      if( rotation.x - self.orbital.x < -180 ) rotation.x += 360;
    }

    self.tween.rotation = new TWEEN.Tween( self.orbital )
      .easing( self.tween.easing )
      .to( rotation,duration )
      .start();
  }

}

//

var userUpdate = (function () {

  var moment = new THREE.Vector3( 0,0,0 );

  return function() {
    var self = this;
    var size = [this.surface.width(),this.surface.height()];

    if( this.mouse.down && self.attraction === 0 ) {
      //moment = new THREE.Vector3( 0,0,0 );
      moment.x = - ( this.mouse.anchor.x - this.mouse.pos.x ) * this.sensetivity.x / size[0];
      moment.y = - ( this.mouse.anchor.y - this.mouse.pos.y ) * this.sensetivity.y / size[1];

      //console.log( moment );

      if( moment.lengthSq() < this.moment.lengthSq() ) this.stopCounter++;
      else this.stopCounter = this.stopDelay;

      if( this.stopCounter >= this.stopDelay )
      {
        this.stopCounter = 0;
        this.moment.copy( moment );
      }
      return 1;
    }
    else if( self.attraction !== 0 )
    {
      for( var i = 0 ; i < 2 ; i++ )
      {
        var denom = this.high[i] - this.low[i];
        if( denom === 0 ) continue;
        var d = size[i] / 2 - this.mouse.pos[i];
        if( d < 0 ) d *= Gutils.sqr( ( this.orbital[i] - this.low[i] ) / denom )
        else d *= Gutils.sqr( ( this.high[i] - this.orbital[i] ) / denom )
        d = self.attraction * 0.1 * d * this.sensetivity[i] / size[i];
        this.moment[i] = d;
      }
      return 1;
    }

    return 0;
  }
})();

//

var update = function () {

  var self = this;

  //if( this.moment.length() > 0 )
  //Gutils.log( 'this.moment:',this.moment );

  var camera = self.camera;
  this.userUpdate();

  this.orbital.add( this.moment );
  if( this.mouse.down )
  {
    this.orbital.y = THREE.Math.clamp( this.orbital.y,this.low.y,this.high.y );
  } else {
    if( this.orbital.y >= this.high.y)
    {
      this.orbital.y = this.high.y;
      this.moment.y *= -1;
    }
    else if( this.orbital.y <= this.low.y)
    {
      this.orbital.y = this.low.y;
      this.moment.y *= -1;
    }
  }

  //if( this.moment.length() > 0 )
  //Gutils.log( 'this.moment:',this.moment );

  var m = this.moment.length();
  if( m >= this.speed )
  {
    //console.log( 'm:',m );
    if( m > 1e-5 )
    {
      d = 1 - (1 - this.speed/m) * this.damping;
      this.moment.multiplyScalar( d );
    }
    else if( this.speed == 0 ) this.moment.set( 0,0,0 );
  }
  else this.moment.set( 0,0,0 );
  this.mouse.anchor = this.mouse.pos.clone();

  self.rotate.x = this.orbital.x * Math.PI / 180;
  self.rotate.y = this.orbital.y * Math.PI / 180;

  self.quaternion1.setFromAxisAngle( self.axis1,Math.PI + self.rotate.x );
  self.quaternion2.setFromAxisAngle( self.axis2,Math.PI / 2 - self.rotate.y );
  self.quaternion.setFromAxisAngle( self.axis2,self.rotate.y ).multiply( self.quaternion1 );
  //self.quaternion.copy( self.quaternion2 ).multiply( self.quaternion1 );
  self.quaternion0.copy( self.quaternion2 ).multiply( self.quaternion1 ).inverse();

  camera.position.copy( self.axis1 ).multiplyScalar( this.orbital.z ).applyQuaternion( self.quaternion0 );
  camera.position.add( self.position );
  //camera.position.y = ( this.orbital.z ) * Math.cos( self.rotate.y );
  //camera.position.x = ( this.orbital.z ) * Math.sin( self.rotate.y ) * Math.cos( self.rotate.x );
  //camera.position.z = ( this.orbital.z ) * Math.sin( self.rotate.y ) * Math.sin( self.rotate.x );
  //camera.updateMatrix();
  //Gutils.log( camera.matrix );
  //Gutils.log();

  camera.lookAt( self.position );

  //if( this.moment.length() > 0 )
  //Gutils.log( 'this.moment:',this.moment );

  if( self.scene )
  {
    //self.scene.updateMatrixWorld();
  }
  self.camera.updateMatrixWorld();

}


//

var handleMouseDown = function ( event,element ) {
  var self = this;
  if( !this.onMouse( self.arg,self,event ) ) return;

  event.preventDefault();
  this.mouse.down = true;
  this.mouse.anchor.set( event.clientX,event.clientY );
  this.mouse.pos.set( event.clientX,event.clientY );
}

//

var handleMouseMove = function ( event,element ) {
  var self = this;
  if( !this.onMouse( self.arg,self,event ) ) return;
  event.preventDefault();
  this.mouse.pos.set( event.clientX,event.clientY );
}

//

var handleMouseUp = function ( event,element ) {
  event.preventDefault();
  this.mouse.down = false;
}

//

var handleWheel = function( event,element,delta ) {
  var self = this;
  if( !this.onMouse( self.arg,self,event ) ) return;
  event.preventDefault();
  delta = event.deltaY;
  self.zoom( delta );
}

//

var onMouse = function( event,element,control ){
  return true;
}

ControlOrbital.prototype = {

// -- constructor
  init: init,
  update: update,
  userUpdate: userUpdate,

  setRotation: setRotation,
  toggleRotation: toggleRotation,
  getOrbitalWithMatrix: getOrbitalWithMatrix,
  bound: bound,
  zoom: zoom,
  animate: animate,
  transit: transit,

  handleMouseDown: handleMouseDown,
  handleMouseMove: handleMouseMove,
  handleMouseUp: handleMouseUp,
  handleWheel: handleWheel,

// -- var
  mouse: mouse,

  // vector options
  position: position,
  low: low,
  high: high,
  initial: initial,
  moment: moment,
  orbital: orbital,
  target: target,
  animateState: animateState,
  sensetivity: sensetivity,

  //
  axis1: axis1,
  axis2: axis2,
  quaternion: quaternion,
  quaternion0: quaternion0,
  quaternion1: quaternion1,
  quaternion2: quaternion2,

  // scalar options
  stopCounter: stopCounter,
  stopDelay: stopDelay,
  speed: speed,
  attraction: attraction,
  damping: damping,
  rotate: rotate,
  surface: surface,


// -- parameter
  surfacePath: surfacePath,
  surface: surface,
  scene: scene,
  camera: camera,
  onMouse: onMouse,
  arg: arg

};

})();