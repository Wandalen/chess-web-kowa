Detector = function ( options ) {
  this.init( options );
};

(function(){

var $ = jQuery;

// single parameters
var surfacePath = 'body';
var camera = null;
var scene = null;
var gpu = 1;
var pickingSize = [512,512];

// var

var mouse =
{
  pos: new THREE.Vector2(),
  down: false
}

//

var dragInfo =
{
  surface: null,
  plane: null,
  active: false,

  anchorScreen: new THREE.Vector2(),
  anchorWorld: new THREE.Vector3(),
  objectWorld: new THREE.Vector3(),

  down: null,
  up: null,

  detectNumber: 1,
  detectPosition: 1
}

//

var init = function( options ) {

  var self = this;
  options = options || {};
  self.handler = self.handlerDefault;
  Gutils.mapExtend( self,options );
  self.pickingSize = Gutils.clone( pickingSize );
  self.mouse = Gutils.clone( mouse );
  self.dragInfo = Gutils.clone( dragInfo );
  self.projector = new THREE.Projector();
  self.raycaster = new THREE.Raycaster();
  self.surface = $( self.surfacePath );
  if( !self.surface.length ) self.surface = $( self.surfacePath );
  self.handlers = [];
  self.mouseMoveQueue = [];


  if( !this.surface) throw 'Detector: no surface found';
  if( !this.scene ) throw 'Detector: no scene found';
  if( !this.camera ) throw 'Detector: no camera found';
  //if( !this.renderer ) throw 'Detector: no renderer found';

  //

  var planeGeometry = new THREE.PlaneGeometry( 100000, 100000, 16, 16 );
  var planeMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    opacity: 0.25,
    transparent: true,
    wireframe: true,
    side: THREE.DoubleSide
  });
  self.dragInfo.plane = new THREE.Mesh( planeGeometry,planeMaterial );
  self.dragInfo.plane.visible = false;
  //self.scene.add( self.dragInfo.plane ); // xxx

  //

  var parameters =
  {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    anisotropy: 0,
    stencilBuffer: false,
    format: THREE.RGBAFormat
  };

  self.renderTargetSelect = new THREE.WebGLRenderTarget( pickingSize[0], pickingSize[1], parameters );
  self.renderTargetSelect.generateMipmaps = false;

  self.renderTargetDepth = new THREE.WebGLRenderTarget( pickingSize[0], pickingSize[1] );
  self.renderTargetDepth.generateMipmaps = false;

  var shader = ShaderDepth;
  self.materialDepth = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader,
    lights: false,
    blending: THREE.NoBlending
  });

  //

  if( self.handler ) self.addHandler( self.handler );
  self.bindHandler();

}

//

var bindHandler = function() {

  var self = this;

  $( self.surface )
  .mousemove(function( event ) {

    //console.log( 'down',self.dragInfo.down );
    //console.log( 'up',self.dragInfo.up );

    var t = $( this );
    event.preventDefault();
    self.mouseMoveQueue.push( event );
    setTimeout(function(){
      if( !self.mouseMoveQueue.length ) return;
      if( self.mouse.up )
      {
        self.mouse.up = 0;
        self.mouseMoveQueue.splice( 0,self.mouseMoveQueue.length );
        return;
      }
      var event = self.mouseMoveQueue[self.mouseMoveQueue.length-1];
      self.mouseMoveQueue.splice( 0,self.mouseMoveQueue.length );
      self.handleMouse( event,t );
      self.handleDrag( event,t );
    },25);

  })
  .mouseup(function( event ) {

    //console.log( 'down',self.dragInfo.down );
    //console.log( 'up',self.dragInfo.up );

    self.mouse.down = 0;
    self.mouse.up = 1;
    var t = $( this );
    event.preventDefault();
    self.handleMouse( event,t );

    self.handleDrag( event,t ); // xxx

    self.handleDragStop( event,t );
    self.handleMouseUp( event,t );

  })
  .mousedown(function( event ) {

    //console.log( 'down',self.dragInfo.down );
    //console.log( 'up',self.dragInfo.up );

    self.mouse.down = 1;
    self.mouse.up = 0;
    var t = $( this );
    event.preventDefault();
    self.handleMouse( event,t );
    self.handleMouseDown( event,t );
    self.handleDragStart( event,t );

  })
  .mouseleave(function( event ) {

    var t = $( this );
    self.undetect();

  });


}

//

var addHandler = function( handler ) {

  var self = this;
  var index = Gutils.len( self.handlers );
  var h = {};
  Gutils.mapExtend( h,self.handlerDefault );
  Gutils.mapExtend( h,handler );
  h.detected = null;
  h.index = index;
  self.handlers[index] = h;
  return h;

}

//

var getWithIndex = function( array,index ) {

  return Gutils.arrayIs( array ) ? array[index] : array;

}

//

var makeArray = function( src,len ) {

  var result = [];
  if( Gutils.arrayIs( src ) ) return src;
  else for( var i = 0 ; i < len ; i++ )
  result[i] = src;
  return result;

}

//

var updateProjector = function() {

  var self = this;
  var vector = new THREE.Vector3( self.mouse.pos.x, self.mouse.pos.y, 1 );
  self.projector.unprojectVector( vector, self.camera );
  self.raycaster.set( self.camera.position, vector.sub( self.camera.position ).normalize() );

}

//

var useGpuSet = function( src ) {

  var self = this;
  if( src ) self.detect = self.detectWithGpu;
  else self.detect = self.detectWithProjector;

}

//

var useGpuGet = function() {

  var self = this;
  return self.detect === self.detectWithGpu;

}

//

var transformDragSurface = function( detected ) {

  var self = this;
  var o = detected.object;

  self.dragInfo.anchorScreen.copy( self.mouse.pos );
  self.dragInfo.anchorWorld.copy( detected.point );

  //self.dragInfo.objectWorld.copy( detected.object.position );
  self.dragInfo.objectWorld.setFromMatrixPosition( detected.object.matrixWorld );

  self.dragInfo.surface = null;
  //self.dragInfo.plane.position.copy( detected.point );
  //self.dragInfo.plane.position.copy( self.dragInfo.objectWorld );
  self.dragInfo.plane.position.copy( self.dragInfo.anchorWorld );

  // test
/*
  var matrixWorld = detected.object.parent.matrixWorld;
  var matrixWorldInv = new THREE.Matrix4();
  matrixWorldInv.getInverse( matrixWorld );
  var offset = new THREE.Vector3();
  var surface = self.dragInfo.surface ? self.dragInfo.surface : self.dragInfo.plane;
  var intersects = self.raycaster.intersectObject( surface );
  if( intersects.length )
  {
    offset.copy( intersects[0].point ).sub( self.dragInfo.anchorWorld );//.divide( scale );
    console.log( 'init: ',Gutils.toStr( offset ) );
    newPostion = new THREE.Vector3();
    newPostion.addVectors( self.dragInfo.objectWorld,offset );
    newPostion.applyMatrix4( matrixWorldInv );
    detected.object.position.copy( newPostion );
  }
*/
  //

  if( o.detector )
  {
    if( o.detector.surface )
    {
      self.dragInfo.surface = o.detector.surface;
    }
    if( o.detector.plane )
    {
      /*
      var pv = new THREE.Vector3( 0,0,1 );
      var pos0 = new THREE.Vector3();
      var pos1 = new THREE.Vector3();
      var pos2 = new THREE.Vector3();
      pos0.setFromMatrixPosition( o.matrixWorld );
      pos1.setFromMatrixPosition( o.detector.plane[0] );
      pos2.setFromMatrixPosition( o.detector.plane[1] );
      pos1.sub( pos0 );
      pos2.sub( pos0 );
      pos0.crossVectors( pos1,pos2 ).normalize();
      self.dragInfo.plane.quaternion.copy( Gutils.quatWithVectors( pv,pos0 ) );
      */
      var poses = Gutils.getPosesFromMatrices( [o.matrixWorld,o.detector.plane[0],o.detector.plane[1]] );
      self.dragInfo.plane.quaternion.copy( Gutils.quatWithPlane( poses ) );
    }
  }
  else
  {
    self.dragInfo.plane.lookAt( self.camera.position );
  }
  //self.dragInfo.plane.visible = true;
  self.dragInfo.plane.updateMatrixWorld();

  self.updateProjector();
  var surface = self.dragInfo.surface ? self.dragInfo.surface : self.dragInfo.plane;
  var intersects = self.raycaster.intersectObject( surface );
  if( intersects.length>0 )
  {
    self.dragInfo.anchorWorld.copy( intersects[0].point );
  }

}

//

var handleMouse = function( event,t )
{

  var self = this;
  var offset = t.offset();
  self.mouse.pos.x = + ( (event.clientX - offset.left) / t.width() ) * 2 - 1;
  self.mouse.pos.y = - ( (event.clientY - offset.top) / t.height() ) * 2 + 1;
  self.detect();

}

//

var handleMouseDown = function( event,t )
{

  var self = this;
  self.dragInfo.down = 0;
  self.dragInfo.up = 0;
  for( var i = 0 ; i < self.handlers.length ; i++ )
  {
    var handler = self.handlers[i];
    if( handler.detected )
    {
      handler.onDown( handler.arg,handler.detected,self,event );
      self.dragInfo.down = handler.detected;
    }
  }

}

//

var handleMouseUp = function( event,t )
{

  var self = this;
  self.dragInfo.down = 0;
  self.dragInfo.up = 0;
  for( var i = 0 ; i < self.handlers.length ; i++ )
  {
    var handler = self.handlers[i];
    if( handler.detected )
    {
      handler.onUp( handler.arg,handler.detected,self,event );
      self.dragInfo.up = handler.detected;
    }
  }

}

//

var handleDragStart = function( event,t,index )
{

  var self = this;
  if( self.dragInfo.active ) return; //

  var handlers = ( index !== undefined ) ? [self.handlers[index]] : self.handlers;
  for( var i = 0 ; i < handlers.length ; i++ )
  {
    var handler = handlers[i];
    if( !handler.detected ) continue;
    self.dragInfo.active = 1;
    self.dragInfo.active = handler.onDragStart( handler.arg,handler.detected,self,event );
    if( self.dragInfo.active )
    {
      self.dragInfo.handler = handler;
      self.transformDragSurface( handler.detected );
      self.surface.css( 'cursor', 'move' );
    }
  }

}

//

var handleDragStop = function( event,t )
{

  var self = this;
  //console.log( 'handleDragStop: ',self.dragInfo.active );
  if( self.dragInfo.active )
  {
    var handler = self.dragInfo.handler;
    self.dragInfo.active = false;
    handler.onDragStop( handler.arg,handler.detected,self,event );
    self.dragInfo.surface = null;
    self.dragInfo.handler = null;
    self.dragInfo.plane.visible = false;
    self.surface.css( 'cursor', '' );
  }

}

//

var handleDrag = function( event,t )
{
  var self = this;

  self.dragInfo.event = event;
  if( !self.mouse.down )
  {
    if( self.dragInfo.active ) self.handleDragStop( event,t );
    return;
  }

  if( self.dragInfo.active )
  {
    var handler = self.dragInfo.handler;
    var active = handler.onDrag( handler.arg,handler.detected,self,event );
    if( !active ) self.handleDragStop( event,t );
    return;
  }

  //self.handleDragStart( event,t ); // xxx
}

//

var handleEnter = function( handler ) {

  var self = this;
  if( handler.detected )
  {
    handler.detected.object.traverse( function ( object ) {
      var material = object.material;
      if( material )
      {
        if( handler.colorKey )
        {
          object.currentColor = material[handler.colorKey] ? material[handler.colorKey].getHex() : 0x000000;
          if( !material[handler.colorKey] ) material[handler.colorKey] = new THREE.Color();
          material[handler.colorKey].setHex( handler.color );
        }
      }
    });
    handler.onEnter( handler.arg,handler.detected,self );
  }

}

//

var handleLeave = function( handler ) {

  var self = this;
  if( handler.detected )
  {
    handler.onLeave( handler.arg,handler.detected,self );
    handler.detected.object.traverse( function ( object ) {
      if( object.material )
      if( handler.colorKey )
      object.material[handler.colorKey].setHex( object.currentColor );
    });
    handler.detected = null;
  }


}

//

var handleHover = function( handler,entered ) {

  var self = this;
  if( handler.detected )
  {
    handler.onHover( handler.arg,handler.detected,self );
  }

}

//

var detectWithGpu = function( detectPosition,detectNumber ) {

  var self = this;
  var intersections = [];
  if( self.dragInfo.active ) return;

  detectPosition = self.dragInfo.detectPosition || detectPosition;
  if( detectNumber === undefined ) detectNumber = self.dragInfo.detectNumber;

  self.detectWithGpuIntersectionsAct( intersections,detectPosition );
  return self.detectAct( intersections );
};

//

var detectWithGpuIntersectionsAct = (function() {

  var projectionMatrix = new THREE.Matrix4();
  var unprojectionMatrix = new THREE.Matrix4();
  var color = new Uint8Array( 4 );
  var depth = new Uint8Array( 4 );

  return function( intersections,detectPosition ){

    var self = this;

    //

    var point = new THREE.Vector3();
    var gl = self.renderer.getContext();
    var z = 0;
    var scaler = [self.renderTargetSelect.width*0.5, self.renderTargetSelect.height*0.5];
    var pos = [(self.mouse.pos[0]+1)*scaler[0], (self.mouse.pos[1]+1)*scaler[1]];

    //self.scene.overrideMaterial = null;
    //var fogWas = self.scene.fog;
    //delete self.scene.fog;
    var rendererShadowMapEnabledWas = self.renderer.shadowMapEnabled;
    self.renderer.shadowMapEnabled = false;

    //self.renderer.renderWithMaterial( self.scene, self.camera, undefined, undefined, 'select' );
    self.renderer.renderWithMaterial( self.scene, self.camera, self.renderTargetSelect, undefined, 'select' );
    gl.readPixels( pos[0], pos[1], 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color );
    var object = self.renderer.getObjectWithColor( color );
    if( object )
    {
      var intersection = { object:object };
      if( detectPosition )
      {

        unprojectionMatrix.getInverse( self.camera.projectionMatrix );
        unprojectionMatrix.multiplyMatrices( self.camera.matrixWorld, unprojectionMatrix );
        self.materialDepth.uniforms.mNear.value = self.camera.near;
        self.materialDepth.uniforms.mFar.value = self.camera.far;
        //self.materialDepth.uniforms.opacity.value = self.materialDepth.opacity;
        self.scene.overrideMaterial = self.materialDepth;
        //self.renderer.render( self.scene, self.camera, undefined, true );
        self.renderer.render( self.scene, self.camera, self.renderTargetDepth, true );
        self.scene.overrideMaterial = null;
        gl.readPixels( pos[0], pos[1], 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, depth );
        //console.log( 'depth:',depth );
        z = Gutils.packInt4ToFloat( depth );

        point.set( self.mouse.pos.x, self.mouse.pos.y, z );
        //console.log( point );
        point.applyProjection( unprojectionMatrix );
        intersection.point = point;
        //console.log( depth );
        //console.log( z );
        //console.log( point );
      }

/*
      {
        self.updateProjector();
        var intersections_ = self.raycaster.intersectObject( self.scene,true );
        if( intersections_.length )
        {
          projectionMatrix.getInverse( self.camera.matrixWorld );
          projectionMatrix.multiplyMatrices( self.camera.projectionMatrix, projectionMatrix );
          console.log( 'realPoint:',intersections_[0].point );
          var projectedPoint = intersections_[0].point.applyProjection( projectionMatrix );
          console.log( 'projectedPoint:',projectedPoint );
        }
      }
      console.log('');
*/

      intersections.push( intersection );
    }

    //

    self.renderer.shadowMapEnabled = rendererShadowMapEnabledWas;
    return intersections;
  };

})();

//

var detectWithProjector = function() {

  var self = this;
  if( self.dragInfo.active ) return;
  self.updateProjector();
  var intersectionsAll = self.raycaster.intersectObject( self.scene,true );
  return self.detectAct( intersectionsAll );

}

//

var detectAct = function( intersectionsAll ) {

  var self = this;
  var newIntersection = null;
  var entered = 0;
  var left = 0;

  for( var h = 0 ; h < self.handlers.length ; h++ )
  {

    var intersections = intersectionsAll.slice(0);
    var handler = self.handlers[h];

    for( var i = intersections.length-1 ; i >= 0 ; i-- )
    {
      //if( intersections[0].object === self.dragInfo.surface )
      //console.log( 'removed surface' );
      if( intersections[i].object === self.dragInfo.plane || intersections[i].object === self.dragInfo.surface )
      intersections = intersections.splice( 0,intersections.length-1 );
    }

    if( intersections.length > 0 )
    {
      newIntersection = handler.onDetect( handler.arg,intersections,self );
      //if( newIntersection && !Gutils.isArray( newIntersection ) ) throw "Detecotr.js: onDetect: bad return";
    }

    if( newIntersection )
    {

      if( handler.detected && handler.detected.object != newIntersection.object ) left = 1;
      if( !handler.detected || handler.detected.object != newIntersection.object ) entered = 1;
    }
    else
    {
      if( handler.detected ) left = 1;
    }

    if( left ) self.handleLeave( handler );
    handler.detected = newIntersection;
    if( entered ) handleEnter( handler );
    if( handler.detected ) self.handleHover( handler );

  }

}

//

var undetect = function( force ) {

  var self = this;
  if( self.dragInfo.active && !force ) return;

  for( var i = 0 ; i < self.handlers.length ; i++ )
  {

    var handler = self.handlers[i];
    if( handler.detected ) self.handleLeave( handler );

  }

  self.mouse.pos.set( -10000,-10000 );

}

//

var drag = function( arg,detected,detector ) {

  detector.updateProjector();
  if( !detected.object.parent ) return;
  var matrixWorld = detected.object.parent.matrixWorld;
  var matrixWorldInv = new THREE.Matrix4();
  matrixWorldInv.getInverse( matrixWorld );

  var offset = new THREE.Vector3();
  var surface = detector.dragInfo.surface ? detector.dragInfo.surface : detector.dragInfo.plane;
  var intersects = detector.raycaster.intersectObject( surface );

  if( intersects.length === 0 ) return true;
  offset.copy( intersects[0].point ).sub( detector.dragInfo.anchorWorld );
  detected.object.position.addVectors( detector.dragInfo.objectWorld,offset );
  detected.object.position.applyMatrix4( matrixWorldInv );

  return true;

}

//

var positionOnPlane = function( position ) {

  var self = this;
  self.updateProjector();
  var surface = self.dragInfo.surface ? self.dragInfo.surface : self.dragInfo.plane;
  surface.position.copy( position );
  surface.lookAt( self.camera.position );
  surface.updateMatrix();
  surface.updateMatrixWorld();
  var intersects = self.raycaster.intersectObject( surface );
  if( intersects.length <= 0 ) return;
  //console.log( 'intersects[0].point: ',Gutils.toStr( intersects[0].point ) );
  return intersects[0].point;

}

// handler
var handlerDefault =
{

  color : 0xffffff,
  colorKey : 'emissive',
  arg : null,

  onDetect : function( arg,intersects,detector ) {
    return intersects[0];
  },

  onHover: function( arg,intersects,detector ) {
    return true;
  },

  onEnter: function( arg,intersects,detector ) {
    return true;
  },

  onLeave: function( arg,intersects,detector ) {
    return true;
  },

  onDown : function( arg,detected,detector,event ) {
    return true;
  },

  onUp: function( arg,detected,detector,event ) {
    return true;
  },

  onDrag : function( arg,detected,detector ) {
    return detector.drag( arg,detected,detector );
  },

  onDragPassive : function( arg,detected,detector ) {
    return false;
  },

  onDragStart : function( arg,detected,detector ) {
    return true;
  },

  onDragStop : function( arg,detected,detector ) {
    return true;
  }

}

Detector.prototype = {

  // routine

  init: init,
  bindHandler: bindHandler,
  addHandler: addHandler,
  transformDragSurface: transformDragSurface,

  //

  handleMouse: handleMouse,
  handleMouseDown: handleMouseDown,
  handleMouseUp: handleMouseUp,

  handleDrag: handleDrag,
  handleDragStart: handleDragStart,
  handleDragStop: handleDragStop,

  handleEnter: handleEnter,
  handleLeave: handleLeave,
  handleHover: handleHover,

  //

  detectWithGpu: detectWithGpu,
  detectWithGpuIntersectionsAct: detectWithGpuIntersectionsAct,
  detectWithProjector: detectWithProjector,
  detect: detectWithProjector,
  //detect: detectWithGpu,
  detectAct: detectAct,
  undetect: undetect,

  //

  drag: drag,
  positionOnPlane: positionOnPlane,
  updateProjector: updateProjector,

  useGpuSet: useGpuSet,
  useGpuGet: useGpuGet,

  // parameter

  surfacePath: surfacePath,
  gpu: gpu,
  camera: camera,
  scene: scene,

  // var

  handlerDefault: handlerDefault

};


Object.defineProperty( Detector.prototype, 'useGpu', {
  set : function( src ){ this.useGpuSet( src ); },
  get : function(){ return this.useGpuGet(); },
  enumerable : false,
});

})();