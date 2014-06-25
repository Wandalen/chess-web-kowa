Visualiser = function ( options ) {
  arguments.callee.prototype.init.call( this,options );
};

(function(){

// -- var
var $ = jQuery;
var Self = Visualiser;
var surfacePath = 'body';

var surface = {};
var camera = {};
var renderer = {};
var scene = {};
var controlClass = ControlOrbital;
var control = {};
var clock = {};

var time = 0;
var timeDelta = 0;
var rotatingObjects = [];
var morphedObjects = [];
var daeObjects = [];

var light = {};
var isFullscreen = 0;

var trackObjects = 0;
var stopped = 0;
var fov = 50;

var softwareRendererFallback = 0;
var arg = null;

var stat = {};
var statVisible = false;

//

var feature =
{
  webgl:
  function(){
    //return 0;
    try
    {
      var canvas = canvasGet();
      if( canvas.type == "application/x-webgl" )
      {
        if( window.WebGLRenderingContext ) return 2;
        else return 1;
      }
      else if( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) )
      {
        if( window.WebGLRenderingContext ) return 2;
        else return 1;
      }
      return 0;
    }
    catch( e )
    { return 0; }
  },

  canvas:
  function(){
    var canvas = document.createElement( 'canvas' );
    return !!canvas;
    //return !!window.CanvasRenderingContext2D,
  },

//worker: !! window.Worker,
//file: window.File && window.FileReader && window.FileList && window.Blob

}

//

var init = function( options ) {

  var self = this;
  options = options || {};
  Gutils.mapExtend( self,options );
  self.initFeatures();

  if( this.surfacePath === undefined ) this.surface = $( document.createElement( "div" ) );
  else this.surface = $( this.surfacePath );
  if( !this.surface.length ) throw 'Visualiser: no surface found';

  if( !self.webglCheck( this.surface,this.softwareRendererFallback ) ) return;

  this.clock = new THREE.Clock();

  this.scene = new THREE.Scene();
  this.addCamera();
  this.light = new THREE.SpotLight( 0xffffff, 0.90, 1500 );
  //this.light.intensity = 0;
  this.scene.add( this.light );

  if( this.controlClass )
  this.control = new this.controlClass({
    surfacePath : this.surface[0],
    camera : this.camera,
    scene: this.scene,
    onMouse : this.handleMouseControl,
    arg : self
  });

  // render
  try
  {
    if( self.feature.webgl )
    {
      this.canvas = self.canvasGet( this.surface );
      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true, canvas: this.canvas });
      //this.renderer = new THREE.WebGLDeferredRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true, canvas: this.canvas, renderer: this.renderer });
    }
    else if( self.softwareRendererFallback )
    {
      this.renderer = new THREE.SoftwareRenderer({ alpha: true, antialias: true });
    }
    //this.renderer = new THREE.CanvasRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true, canvas: this.canvas });
    //this.renderer = new THREE.SVGRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    //this.renderer = new THREE.WebGLRenderer3({ contextAttributes: { alpha: true, antialias: true, preserveDrawingBuffer: true }} );
  }
  catch( err )
  {
    console.log( 'WebGL error: ',err );
    self.webglCheck( this.surface,this.softwareRendererFallback,1 );
    return;
  }

  //var size = self.sizeGet();
  //this.renderer.setSize( size[0],size[1] );
  this.renderer.setClearColor( 0x000000, 0 );
  //this.renderer.setClearColor( 0xaa0000, 1 );
  //this.renderer.clear();
  this.renderer.sortObjects = true;
  this.renderer.gammaInput = true;
  this.renderer.gammaOutput = true;
  this.renderer.physicallyBasedShading = true;
  this.surface.append( this.renderer.domElement );

  // handler

  self.handleResize();

  this.surface.resize( function( event )
  {
    self.handleResize( event,this )
  });

  window.addEventListener( "resize", function( arg ){ self.handleResize( arg,this ) }, false );
  window.addEventListener( "contextmenu", function( arg ){ self.handleContextMenu( arg,this ) }, false );
  window.addEventListener( "keyup", function( arg ){ self.handleKey( arg,this ) }, false );

  if( this.surfacePath === undefined )
  document.body.appendChild( this.surface[0] );

  if( !self.stopped ) this.animate();
}

//

var initFeatures = function() {

  var self = this;
  for( var f in self.feature )
  {
    if( Gutils.routineIs( self.feature[f] ) )
    self.feature[f] = self.feature[f]();
  }

}

//

var loadObject = function( scenePath,onLoaded,arg,replace,loader ) {

  var self = this;
  var replace = replace === undefined ? false : replace;

  if( !loader )
  {
    loader = new SceneLoader();
    loader.crossOrigin = 'anonymous';
    //loader.addGeometryHandler( "binary", THREE.BinaryLoader );
    //loader.addGeometryHandler( "vtk", THREE.VTKLoader );
    //loader.addGeometryHandler( "stl", THREE.STLLoader );
    //loader.addHierarchyHandler( "obj", THREE.OBJLoader );
    //loader.addHierarchyHandler( "wrl", THREE.VRMLLoader );
    //loader.addHierarchyHandler( "utf8", THREE.UTF8Loader );

    //loader.addHierarchyHandler( "dae", THREE.ColladaLoader );
    loader.addHierarchyHandler( "dae", ColladaLoader2 );
  }

  var show = function( replace ) {
    if( replace )
    {
      xxx
      var canvas = this.surface.find( 'canvas' );
      self.camera = self.loaded.currentCamera;
      self.camera.aspect = canvas.width() / canvas.height();
      //self.camera.aspect = window.innerWidth / window.innerHeight;
      self.camera.updateProjectionMatrix();
      self.scene = self.loaded.scene;
      self.update();
      //self.update();
    } else {
      self.scene.add( loader.store.scene );
    }
    if( loader.store.materials.rims )
    {
      //self.update();
    }

    //self.scene.updateMatrixWorld();
    //self.renderer.initWebGLObjects( self.scene );
    //self.update();
  }

  var callbackProgress = function( progress, store ) {
    self.onObjectLoading( self.arg,self,[progress.loaded.total(),progress.loading.total()] );
    Logger.log( 'Loaded:',progress.loaded.total(),' / ',progress.loading.total() );
  }

  var callbackSync = function( store ) {
    //show();
  }

  var callbackFinished = function ( store ) {

    //loader.store = store;

    if( self.trackObjects )
    store.scene.traverse( function ( object ) {

      if ( object.userData.rotating === true ) {
        self.rotatingObjects.push( object );
      }

      if ( object instanceof THREE.MorphAnimMesh ) {
        self.morphedObjects.push( object );
      }

      if ( object instanceof THREE.SkinnedMesh ) {
        if ( object.geometry.animation ) {
          THREE.AnimationHandler.add( object.geometry.animation );
          var animation = new THREE.Animation( object, object.geometry.animation.name );
          animation.JITCompile = false;
          animation.interpolationType = THREE.AnimationHandler.LINEAR;
          animation.play();
        }
      }

    } );

    show();
    if( onLoaded ) onLoaded( loader.store,arg );
  }

  loader.callbackSync = callbackSync;
  loader.callbackProgress = callbackProgress;
  loader.callbackFinished = callbackFinished;
  loader.load( scenePath );
  return loader;
}

//

var start = function() {

  var self = this;
  if( self.stopped )
  {
    self.stopped = 0;
    self.update();
    self.animate();
  }

}

//

var stop = function() {

  var self = this;
  self.stopped = 1;

}

// -- property

var sizeGet = function() {

  return [this.surface.width(),this.surface.height()];

}

// -- object manipulator

var addCamera = function() {

  var self = this;
  var size = self.sizeGet();
  this.camera = new THREE.PerspectiveCamera( this.fov, size[0]/size[1], 1, 10000 );
  this.scene.add( this.camera );

}

//

var remove = function( object ) {

  var self = this;
  if( !object ) return;
  try
  {
    object.traverse( function ( object ) {

      if ( object.userData.rotating === true ) {
        var index = self.rotatingObjects.indexOf( object );
        if (index > -1) self.rotatingObjects.splice(index, 1);
      }

      if ( object instanceof THREE.MorphAnimMesh ) {
        var index = self.morphedObjects.indexOf( object );
        if (index > -1) self.morphedObjects.splice(index, 1);
      }

      if ( object instanceof THREE.SkinnedMesh ) {
        if ( object.geometry.animation ) {
          THREE.AnimationHandler.remove( object.geometry.animation );
        }
      }

    });
    this.scene.remove( object );
  }
  catch( err )
  {
    console.log( 'Visualiser.remove: ',err );
  }

}

// -- feature

var setFullscreen = function ( mode ) {
  this.webkitFullscreenSupport = "webkitCancelFullScreen" in document ? true : false;
  this.mozFullscreenSupport = "mozCancelFullScreen" in document ? true : false;
  if( mode ) {
    this.isFullscreen = true;
    if( this.webkitFullscreenSupport ) document.body.webkitRequestFullScreen();
    else if( this.mozFullscreenSupport ) document.body.mozRequestFullScreen();
    else
    {
      this.isFullscreen = false;
      alert( "Fullscreen is not supported." );
    };
  } else {
    this.isFullscreen = false;
    if( this.webkitFullscreenSupport ) document.webkitCancelFullScreen();
    else document.mozCancelFullScreen();
  };
}

//

var toggleFullscreen = function () {
  this.setFullscreen( !this.fullscreen );
}

// -- checker

var isIe = function () {
  var result = navigator.userAgent.indexOf("MSIE") >= 0;
  if( result )
  {
    var version = 0;
    var ua = navigator.userAgent;
    var re = new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");
    if (re.exec(ua) != null)
    {
      version = parseInt(RegExp.$1);
    }
    if( version > -1 && version ) result = version;
  }
  //console.log( 'isIe:',result );
  return result;
}

//

var canvasGet = function ( container, id ) {

  var result;
  var ie = isIe();
  if( !ie || ie>=11 )
  {
    result = document.createElement( 'canvas' );
  }
  else
  {
    try
    {
      var pluginInstallerURL = 'http://localhost:1464/WebSite2.0/iewebgl.cab';
      //var currentVersion = "#Version=1,0,1,0";
      var currentVersion = "";
      var result = document.createElement("object");
      if( result )
      {
        //result.id = id;
        result.codeBase = pluginInstallerURL + currentVersion;
        result.type = "application/x-webgl";
      }
      else
      {
        result = document.createElement( 'canvas' );
      }
    }
    catch( err )
    {
      result = document.createElement( 'canvas' );
    }
  }

  if( container && result )
  {
    container = $( container );
    container.append( result );
    $( result ).attr( 'width',container.width()).attr('height',container.height() );
  }

  return result;
}

//

var webglErrorDescription = function () {

  var description = '';
  if( window.WebGLRenderingContext )
  description += 'Your GPU does not support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">WebGL</a>. \n'
  else
  description += 'Your browser does not support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">WebGL</a>, please update it. \n'
  description += 'Get webgl-compatible <a href="http://get.webgl.org/">browser</a>. \n'
  return description;

}

//

var webglError = function () {

  var description = webglErrorDescription();
  var result = $( '<div>' ).append( $.parseHTML( description ) ).addClass( 'status-error' ).addClass( 'status-error-webgl' );
  return result;

}

//

var webglWarning = function () {

  var description = webglErrorDescription();
  description += 'Poor software renderer is used. \n'
  var result = $( '<div>' ).append( $.parseHTML( description ) ).addClass( 'status-warning' ).addClass( 'status-warning-webgl' );
  return result;

}

//

var webglCheck = function ( surface,useCanvas,forceError ) {

  var self = this;
  var surface = $( surface );
  if( !surface.length ) surface = $( 'body' );
  $( '.status-error-webgl,.status-warning-webgl',surface ).remove();

  if( forceError || ( !self.feature.webgl && !useCanvas ) )
  {
    self.error = 1;
    $( surface ).append( self.webglError() );
    return 0;
  }
  if( !self.feature.webgl && self.feature.canvas && useCanvas )
  {
    $( surface ).append( self.webglWarning() );
    return 1;
  }
  return 1;
}

// -- operation

var autoUpdate = function( state ) {

  var self = this;
  state = state ? true : false;
  if( state !== undefined )
  {
    self.scene.autoUpdate = state;
    //self.renderer.autoUpdateObjects = state; // xxx
  }

  //return self.renderer.autoUpdateObjects;
  return self.scene.autoUpdate && self.renderer.autoUpdateObjects;
}

//

var update = function( force ) {

  var self = this;
  self.scene.updateMatrixWorld();
  self.renderer.initWebGLObjects( self.scene );

}

//

var normalize = function( obj ) {
  obj.traverse( function( node ) {
    if( node.geometry !== undefined )
    {
      //node.geometry.computeVertexNormals();
      //node.geometry.computeFaceNormals();
    }
  } );
}

// -- activity

var animate = function( e ) {

  var self = this;
  if( !self.stopped ) requestAnimationFrame( function(){ self.animate( this ) } );
  if( this.statVisible ) this.stat.update();
  if( this.control ) this.control.update();
  this.timeDelta = this.clock.getDelta();
  this.time += self.timeDelta;
  this.render();

}

//

var render = function () {

  var self = this;
  this.light.position.set( this.camera.position.x, this.camera.position.y, this.camera.position.z );
  //this.light.updateMatrix();
  this.light.updateMatrixWorld();

  this.onPreRender( self.arg,self );
  this.renderer.render( this.scene, this.camera );
  this.onPostRender( self.arg,self );
}

//

var morph = function() {

  //var delta = this.clock.getDelta();

  THREE.AnimationHandler.update( delta * 0.75 );

  for ( var i = 0; i < this.morphedObjects.length; i ++ ) {
    var object = this.morphedObjects[ i ];
    object.updateAnimation( 1000 * delta );
  }

  for ( var i = 0; i < this.rotatingObjects.length; i ++ ) {
    var object = this.rotatingObjects[ i ];
    if ( object.userData.rotateX ) object.rotation.x += 1 * delta;
    if ( object.userData.rotateY ) object.rotation.y += 0.5 * delta;
  }

  for ( var i = 0; i < this.daeObjects.length; i ++ ) {
    var object = this.daeObjects[ i ];
    var skin = objects.skins[0];
    for ( var i = 0; i < skin.morphTargetInfluences.length; i++ ) {
      skin.morphTargetInfluences[ i ] = 0;
    }
    skin.morphTargetInfluences[ Math.floor( this.time * 30 ) ] = 1;
  }

  //this.time += delta;
}

// -- handle

var handleContextMenu = function( arg,e ) {
  arg.preventDefault();
}

//

var handleKey = function ( arg,e ) {
}

//

var handleResize = function ( event,e ) {
  if( event ) event.preventDefault();
  var size = this.sizeGet();
  this.camera.aspect = size[0]/size[1];
  this.camera.updateProjectionMatrix();
  this.renderer.setSize( size[0],size[1] );
}

//

var handleMouseControl = function( self,control,event ){
  return self.onMouseControl( self.arg,control,event );
}

// -- event

var onMouseControl = function( self,control,event ){
  return true;
}

//

var onObjectLoading = function( arg,self,progress ){
  return true;
}

//

var onPreRender = function( arg,self ){ return true; }
var onPostRender = function( arg,self ){ return true; }

//}

Self.prototype = {

  // -- constructor
  init: init,
  initFeatures: initFeatures,
  loadObject: loadObject,
  stop: stop,
  start: start,

  // -- property
  sizeGet: sizeGet,

  // -- object manipulator
  remove: remove,
  addCamera: addCamera,

  // -- features
  setFullscreen: setFullscreen,
  toggleFullscreen: toggleFullscreen,

  // -- handler
  handleContextMenu: handleContextMenu,
  handleKey: handleKey,
  handleResize: handleResize,
  handleMouseControl: handleMouseControl,

  // -- checker
  isIe: isIe,
  canvasGet: canvasGet,
  webglErrorDescription: webglErrorDescription,
  webglError: webglError,
  webglWarning: webglWarning,
  webglCheck: webglCheck,

  // -- operation
  autoUpdate: autoUpdate,
  update: update,
  normalize: normalize,

  // -- activity
  animate: animate,
  render: render,
  morph: morph,

  // -- var
  surface: surface,
  camera: camera,
  renderer: renderer,
  scene: scene,
  clock: clock,
  time: time,
  timeDelta: timeDelta,
  light: light,
  feature: feature,

  trackObjects: trackObjects,
  rotatingObjects: rotatingObjects,
  morphedObjects: morphedObjects,
  daeObjects: daeObjects,

  isFullscreen: isFullscreen,
  fov: fov,
  stat: stat,
  statVisible: statVisible,


  // -- parameter
  surfacePath: surfacePath,
  stopped: stopped,
  controlClass: controlClass,

  onPreRender: onPreRender,
  onPostRender: onPostRender,
  onMouseControl: onMouseControl,
  onObjectLoading: onObjectLoading,

  softwareRendererFallback: softwareRendererFallback,
  arg: arg

}

})();