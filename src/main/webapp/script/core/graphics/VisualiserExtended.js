VisualiserExtended = function ( options ) {
  this.init( options );
};

(function(){

var $ = jQuery;
var Self = VisualiserExtended;
var Parent = Visualiser;

var useComposer = 0;

// -- constructor

var init = function( options ) {

  var self = this;
  Parent.call( self,options );
  if( self.error ) return;
  //self.initPlainShader();
  self.anisotropy = self.renderer.getMaxAnisotropy ? self.renderer.getMaxAnisotropy() : 1;

  // handler
  this.onPreRenders = [];
  this.onPostRenders = [];
  this.onResizes = [];
  window.addEventListener( "resize", function( event ){ self.handleResizes.call( self,this.arg,event ) }, false );

  // loader
  self.imageLoader = new THREE.ImageLoader();
  self.loading = 0;
  self.loaded = 0;
  self.loadFails = 0;
  if( !self.textureParameters ) self.textureParameters = {};
  self.textureParameters.anisotropy = self.anisotropy;
  self.textureParameters.minFilter = THREE.NearestFilter;
  self.textureParameters.magFilter = THREE.NearestFilter;


  // stat
  self.stat = new Stats();
  self.setStatVisible( 1 );
  self.surface.append( this.stat.domElement );

}

// -- loader

var loadHandleLoaded = function( path,texture,onLoaded ){

  self.loading--;
  self.loaded++;

  for( var p in self.textureParameters )
  {
    texture[p] = self.textureParameters[p];
  }

  if( onLoaded ) onLoaded.call( self,self.arg,path,texture );

}

//

var loadHandleError = function( path,texture,onError ){

  console.warn( "VisualiserExtended.js: failed to load",path );
  self.loading--;
  self.loadFails++;
  if( onError ) onError.call( self,self.arg,path,texture );

}

//

var loadModels = function( models, options, onLoaded, onError, onProgress ){

  var result = {};
  var self = this;
  if( !options ) options = {};
  if( !options.path ) options.path = "";
  if( options.path.length )
  if( options.path[options.path.length-1] != '/' ) options.path += '/';
  if( Gutils.stringIs( models ) ) models = [models];

  //

  var lading = Gutils.len( models );
  var handleLoaded = function( name,id ){
    return function( scene,path ) {

      lading--;
      console.log( 'loaded:',name,id );
      if( options.uncover )
      {
        scene = scene.children[0];
      }
      result[name] = scene;
      result[id] = scene;
      scene.name = name;

      //console.log( 'store.scene:',store.scene );
      //store.scene.traverse( function ( object ) {
      //});

      if( !lading && onLoaded ) onLoaded.call( self.arg,result );
    }
  }

  //

  if( Gutils.arrayIs( models ) )
  {
    var i = 0;
    for( var t = 0 ; t < models.length ; t++ )
    {
      var file = models[t];
      self.loadModel( options.path + file, handleLoaded( t,i++,file ) );
    }
  }
  else if( Gutils.objectIs( models ) )
  {
    var i = 0;
    for( var t in models )
    {
      var file = models[t];
      self.loadModel( options.path + file, handleLoaded( t,i++,file ) );
    }
  }

  return result;

}

//

var loadModel = function( path, onLoaded, onError, onProgress ){

  var self = this;

  if( !self.colladaLoader ) self.colladaLoader = new ColladaLoader2();

  var callbackProgress = function( progress ) {
    //console.log( 'Loaded:',progress.loaded,' / ',progress.total );
  }

  var callbackFinished = function ( store ) {

    //console.log( 'store.scene:',store.scene );
    //store.scene.traverse( function ( object ) {
    //});
    if( onLoaded ) onLoaded.call( self.arg,store.scene,path,store );
  }

  //

  self.colladaLoader.callbackProgress = callbackProgress;
  self.colladaLoader.callbackFinished = callbackFinished;
  self.colladaLoader.load( path,callbackFinished,callbackProgress );

}

//

var loadTexture = function( path, mapping, onLoaded, onError ){

  var result;
  var self = this;
  var isCompressed = /\.dds$/i.test( path );

  if( path instanceof THREE.Texture ) return path;

  self.loading++;

  if ( isCompressed ) {
    result = THREE.ImageUtils.loadCompressedTexture(
      path,
      mapping,
      function( path,texture ){ self.loadHandleLoaded.call( self,path,texture,onLoaded ); },
      function( event ){ self.loadHandleError.call( self,event.currentTarget.src,undefined,onError ); }
    );
  } else {
    result = THREE.ImageUtils.loadTexture(
      path,
      mapping,
      function( path,texture ){ self.loadHandleLoaded.call( self,path,texture,onLoaded ); },
      function( event ){ self.loadHandleError.call( self,event.currentTarget.src,undefined,onError ); }
    );
  }

  return result;
}

//

var loadTextureCube = function( path, files, mapping, onLoaded, onError ){

  var result;
  var self = this;
  if( !files ) files = ['px.jpg','nx.jpg','py.jpg','ny.jpg','pz.jpg','nz.jpg']
  var isCompressed = /\.dds$/i.test( files[0] );

  if( path instanceof THREE.Texture ) return path;

  self.loading++;
  if( path[path.length-1] != '/' ) path += '/';

  var urls = [];
  for( var i = 0 ; i < 6 ; i++ )
  {
    var j = files.length > i ? i : files.length-1;
    urls[j] = path + files[i];
  }

  if ( isCompressed ) {
    result = THREE.ImageUtils.loadCompressedTextureCube(
      urls,
      mapping,
      function( path,texture ){ self.loadHandleLoaded.call( self,path,texture,onLoaded ); },
      function( event ){ self.loadHandleError.call( self,event.currentTarget.src,undefined,onError ); }
    );
  } else {
    result = THREE.ImageUtils.loadTextureCube(
      urls,
      mapping,
      function( path,texture ){ self.loadHandleLoaded.call( self,path,texture,onLoaded ); },
      function( event ){ self.loadHandleError.call( self,event.currentTarget.src,undefined,onError ); }
    );
  }

  return result;
}

//

var loadTextures = function( textures, path, mapping, onLoaded, onError ){

  var result = {};
  var self = this;
  if( !path ) path = "";
  if( path.length )
  if( path[path.length-1] != '/' ) path += '/';

  if( Gutils.stringIs( textures ) )
  {
    textures = [textures];
  }

  if( Gutils.arrayIs( textures ) )
  {
    var i = 0;
    for( var t = 0 ; t < textures.length ; t++ )
    {
      var texture = textures[t];
      result[texture] = self.loadTexture( path + texture, mapping, onLoaded, onError );
      result[i++] = result[texture];
    }
  }
  else if( Gutils.objectIs( textures ) )
  {
    var i = 0;
    for( var t in textures )
    {
      var texture = textures[t];
      result[t] = self.loadTexture( path + texture, mapping, onLoaded, onError );
      result[i++] = result[t];
    }
  }

  return result;
}

// -- etc

var setStatVisible = function ( mode ) {
  this.statVisible = mode
  this.stat.domElement.style.visibility = this.statVisible ? "visible" : "hidden"
}

//

var toggleStatVisible = function () {
  this.setStatVisible( !this.statVisible )
}

//

var shadowsEnable = function ( enable,object ) {

  var self = this;
  var object = object || self.scene;
  object.traverse( function ( object ) {

    object.castShadow = enable;
    object.receiveShadow = enable;

  });

};

//

var sceneLog = function( scene ) {
  var scene = scene ? scene : this.scene;
  s = Gutils.nodeDump( scene,'' );
  console.log( s );
}

// -- feature

var setFullscreen = function ( mode ) {
  this.webkitFullscreenSupport = "webkitCancelFullScreen" in document ? true : false;
  this.mozFullscreenSupport = "mozCancelFullScreen" in document ? true : false;
  if( mode ) {
    this.fullscreen = true;
    if( this.webkitFullscreenSupport ) document.body.webkitRequestFullScreen();
    else if( this.mozFullscreenSupport ) document.body.mozRequestFullScreen();
    else
    {
      this.fullscreen = false;
      alert( "Fullscreen is not supported." );
    };
  } else {
    this.fullscreen = false;
    if( this.webkitFullscreenSupport ) document.webkitCancelFullScreen();
    else document.mozCancelFullScreen();
  };
}

//

var toggleFullscreen = function () {
  this.setFullscreen( !this.fullscreen );
}

// -- operation

//

var render = function() {

  var self = this;
  for( var i = 0, l = this.onPreRenders.length ; i < l ; i++ )
  this.onPreRenders[i].render();

  //

  //Parent.prototype.render.apply( this,arguments );

  this.light.position.set( this.camera.position.x, this.camera.position.y, this.camera.position.z );
  this.light.updateMatrixWorld();

  this.onPreRender( self.arg,self );
  this.renderer.render( this.scene, this.camera );
  this.onPostRender( self.arg,self );

  //

  for( var i = 0, l = this.onPostRenders.length ; i < l ; i++ )
  this.onPostRenders[i].render();
}

// -- handler

var handleResizes = function ( arg,event ) {

  for( var i = 0, l = this.onResizes.length ; i < l ; i++ )
  this.onResizes[i].call( arg,this,event );

}


// -- prototype

var Proto = {

  // -- constructor
  init: init,

  // -- loader
  loadModel: loadModel,
  loadModels: loadModels,

  loadTexture: loadTexture,
  loadTextureCube: loadTextureCube,
  loadTextures: loadTextures,

  loadHandleLoaded: loadHandleLoaded,
  loadHandleError: loadHandleError,


  // -- etc
  setStatVisible: setStatVisible,
  toggleStatVisible: toggleStatVisible,
  sceneLog: sceneLog,

  // -- features
  setFullscreen: setFullscreen,
  toggleFullscreen: toggleFullscreen,
  shadowsEnable: shadowsEnable,

  // -- operation
  render: render,

  // -- handler
  handleResizes: handleResizes,

  // -- var
  useComposer: useComposer,

  // -- parameter

}

Self.prototype = Object.create( Parent.prototype );
Gutils.mapExtend( Self.prototype,Proto );

})();