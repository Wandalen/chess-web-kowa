SampleChess = function ( options ) {
  arguments.callee.prototype.init.call( this,options );
};

(function(){

var $ = jQuery;

// -- default parameters
var surfacePath = 'body';
var stopped = 0;
var cellNumber = [8,8];
var boardSize = [350,350];

// -- global var
var instances = [];

// -- var

// -- routine

//

var init = function( options ) {

  var self = this;
  instances.push( self );
  options = options || {};
  Gutils.mapExtend( self,options );

  //

  $( document ).ready( function(){

    // tween

    self.tween = {};
    self.tween.easing = TWEEN.Easing.Sinusoidal.InOut;

    // visualiser

    self.visualiser = [];
    self.visualiser[0] = new VisualiserExtended({
      surfacePath: self.surfacePath,
      onMouseControl: self.handleMouseControl,
      onPreRender: self.handlePreRender,
      arg: self,
      stopped: 1
    });

    var visualiser = self.visualiser[0];
    var container = visualiser.surface;
    var renderer = visualiser.renderer;
    var scene = visualiser.scene;
    var camera = visualiser.camera;
    var surface = visualiser.surface;

    // update

    //visualiser.autoUpdate( 1 );
    //renderer.sortObjects = false;
    scene.setRecursive({ frustumCulled: false });

    // light

    visualiser.light.color.setRGB( 0.4,0.5,0.5 );
    visualiser.light.intensity = 0.5;

    var light = new THREE.DirectionalLight( 0xdfebff, 1.75 );
    light.position.set( 0, 550, 0 );
    light.color.setRGB( 1.3,1.3,1.4 );
    light.castShadow = true;
    light.shadowDarkness = 0.4;
    light.shadowMapWidth = 2048;
    light.shadowMapHeight = 2048;
    light.shadowCameraNear = camera.near;
    light.shadowCameraFar = camera.far;
    light.shadowCameraFov = camera.fov;
    scene.add( light );

    /*
    var light = new THREE.DirectionalLight( 0xdfebff, 1.75 );
    light.position.set( 0, 550, -200 );
    light.color.setRGB( 0.9,0.9,0.95 );
    light.castShadow = true;
    light.shadowDarkness = 0.3;
    light.shadowMapWidth = 2048;
    light.shadowMapHeight = 2048;
    light.shadowCameraNear = camera.near;
    light.shadowCameraFar = camera.far;
    light.shadowCameraFov = camera.fov;
    scene.add( light );
    */

    // control

    visualiser.control.position.set( 0,0,0 ) ;
    visualiser.control.speed = 0;
    visualiser.control.damping *= 1.5;
    //visualiser.control.attraction = 1;

    visualiser.control.low.x = 0;
    visualiser.control.high.x = 360;
    visualiser.control.orbital.x = 0;

    visualiser.control.low.y = 5;
    visualiser.control.high.y = 80;
    visualiser.control.orbital.y = 15;

    visualiser.control.low.z = 250;
    visualiser.control.high.z = 500;
    visualiser.control.orbital.z = 300;

    // shadow

    //visualiser.renderer.shadowMapDebug = true;
    visualiser.renderer.shadowMapEnabled = true;
    //visualiser.renderer.shadowMapCascade = true;
    visualiser.renderer.shadowMapType = THREE.PCFSoftShadowMap;
    //visualiser.renderer.shadowMapType = THREE.PCFShadowMap;

    // handler

    surface
    .mousedown(function( event ) {
      self.handleMouseDown( event,this );
    })

    // environment
    //visualiser.addGroundMirror( 0.3,[370, 370] );

    // detector

    var detectorRegionHandler =
    {
      onDetect : self.handleDetect,
      onDragStart : self.handleDragStart,
      //colorKey: '',
      color: 0xffffff,
      arg : self
    };

    self.detector = new Detector({
      camera: self.visualiser[0].camera,
      scene: self.visualiser[0].scene,
      renderer: self.visualiser[0].renderer,
      surfacePath: self.surfacePath,
      //useGpu: 1,
      handler: null
    });
    self.detector.addHandler( detectorRegionHandler );

    //

    self.initGui();
    self.initChess();

    // launch animation

    if( !self.stopped )
    for( var i = 0; i<self.visualiser.length; i++ )
    {
      var visualiser = self.visualiser[i];
      visualiser.stopped = self.stopped;
      visualiser.update();
      visualiser.animate();
    }

  });
}

//

var initGui = function() {

  var self = this;

  var menu = $("#panel-menu")
  menu.jqxMenu({ width: '100%', height: '32px', autoSizeMainItems: true });
  menu.jqxMenu( 'minimize' );
  menu.css( 'visibility', 'visible' );

  $('#button-fullscreen').mousedown(function(){
    self.visualiser[0].setFullscreen( true );
  })

  $('#button-restart').mousedown(function(){
    self.chess.restart();
  })

  $('#button-about').mousedown(function(){
    $( '#panel-about' ).jqxWindow( 'open' );
  })

  var cbox = $( "#checkbox-camera-transition" );
  cbox.jqxCheckBox({ checked: true });
  cbox.on('change', function () {
    self.chess.transition = cbox.val();
  });

  var about = $('#panel-about');
  about.jqxWindow({
    height: 360,
    width: 470,
    autoOpen: false,
    keyboardCloseKey: 'esc',
    resizable: false,
    isModal: true,
    modalOpacity: 0.3,

  });


}

//

var initChess = function() {

  var self = this;
  var visualiser = self.visualiser[0];
  var container = visualiser.surface;
  var renderer = visualiser.renderer;
  var scene = visualiser.scene;

  // assets

  var MODELS = {

    'k':'k.dae',
    'q':'q.dae',
    'b':'b.dae',
    'n':'n.dae',
    'r':'r.dae',
    'p':'p.dae',

    'frame':'frame.dae'

  }

  var map = visualiser.loadTexture( '/chess/texture/wood/texture.jpg' );
  var bumpMap = visualiser.loadTexture( '/chess/texture/wood/bump.jpg' );
  var attentionMap = visualiser.loadTexture( '/chess/texture/wood/specular.jpg' );

  // game

  var chessOptions =
  {
    scene: scene,
    boardSize:self.boardSize,
    cellNumber:self.cellNumber,
    map: map,
    bumpMap: bumpMap,
    attentionMap: attentionMap,
    orbital: visualiser.control,
    tween: self.tween,
    onMessage: message
  }

  self.chess = new Chess( chessOptions );
  self.chess.selected = [-1,-1];

  // models

  var onLoadedChess = function( models ){

    for( var c in MODELS )
    {
      if( c === 'frame' ) continue;

      var player = self.chess.player.white;
      player.model[c] = models[c];
      player.model[c].material = player.material;
      player.model[c].castShadow = true;
      player.model[c].receiveShadow = true;
      player.model[c].scale.set( 0.01,0.01,0.01 );
      player.model[c].rotation.set( Math.PI / 2,0,0 );

      var player = self.chess.player.black;
      player.model[c] = models[c].clone();
      player.model[c].material = player.material;
      player.model[c].rotation.set( Math.PI / 2,0,Math.PI );

    }

    var frame = models['frame'];
    frame.receiveShadow = true;
    frame.scale.set( 0.3,0.2,0.3);
    scene.add( frame );

    self.chess.restart();

    //self.chess.refresh();

    //visualiser.sceneLog( scene );

  }

  visualiser.loadModels( MODELS,{ path: '/chess/model/chess', uncover: true },onLoadedChess );

}

//

var message = function( msg,time ) {

  if( time === undefined ) time = 1100;
  var mbox = $.messager.show({
    msg: msg,
    showType: 'fade',
    timeout: time,
    style:{
      right:'',
      bottom:''
    }
  });

  mbox.mousedown(function( event ) {

    mbox.parent().hide( "fast" )

  });

}

// -- handler

var handlePreRender = function( self,visualiser ) {

  TWEEN.update();

}

//

var handleMouseDown = function ( event,element ) {

  var self = this;
  self.chess.select( self.chess.selectedCode );

}

//

var handleDetect = function( self,intersects ) {

  self.chess.selectedCode = '';

  if( !self.chess ) return;
  if( intersects.length )
  {
    for( var i = 0 ; i < intersects.length ; i++ )
    {
      if( intersects[i].object.boardPosition )
      {
        self.chess.selected = intersects[i].object.boardPosition.slice();
        var selectedCodeWas = self.chess.selectedCode;
        self.chess.selectedCode = self.chess.codeWithCellPosition( self.chess.selected );
        //if( selectedCodeWas != self.chess.selectedCode ) console.log( self.chess.selectedCode );
        return intersects[i];
      }
    }
  }

  //self.chess.selectedCode = '';

}

//

var handleDragStart = function( self,detected,detector,event ) {

  return 0;

}

//

var handleMouseControl = function( self,control,event ){

  if( !self.detector ) return true;

  switch( event.which ) {
    case 1: // left
      break;
    case 2: // middle
      break;
    case 3: // right
      return false;
      break;
    default:
  }

  return true;

}

// -- proto

SampleChess.prototype = {

// -- constructor
  init: init,
  initGui: initGui,
  initChess: initChess,

// --
  message: message,

// -- handler
  handlePreRender: handlePreRender,
  handleMouseControl: handleMouseControl,

  handleMouseDown: handleMouseDown,
  handleDetect: handleDetect,
  handleDragStart: handleDragStart,


// -- object var
  stopped: stopped,
  cellNumber: cellNumber,
  boardSize: boardSize,


// -- class var
  instances: instances,


// -- parameter
  surfacePath: surfacePath,

};

})();

app = (typeof app !== 'undefined') ? app : new SampleChess({
  surfacePath: '.panel-surface',
});
