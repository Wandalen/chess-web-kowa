
// -- Vector2

window['THREE'].Vector2.prototype.inv = function ( b ) {

  this.x = 1 / this.x;
  this.y = 1 / this.y;
  return this;

}

//

window['THREE'].Vector2.prototype.cross = function ( b ) {

  //xxx
  var mb = b.length();
  var dot = this.dot( b );
  var bp = b.clone().multiplyScalar( dot/(mb*mb) );
  this.sub( bp ).multiplyScalar( mb );
  return this;

}

//

window['THREE'].Vector2.prototype.cross3 = function ( b ) {

  //xxx
  var mb = b.length();
  var dot = this.dot( b );
  var bp = b.clone().multiplyScalar( dot/(mb*mb) );
  this.sub( bp ).multiplyScalar( mb );
  return this;

}

//

window['THREE'].Vector2.prototype.applyMatrix3 = function ( m ) {

  var x = this.x, y = this.y;

  var e = m.elements;
  var d = 1 / ( e[2] * x + e[5] * y + e[8] );

  this.x = ( e[0] * x + e[3] * y + e[6] ) * d;
  this.y = ( e[1] * x + e[4] * y + e[7] ) * d;

  return this;

}

//

window['THREE'].Vector2.prototype.divideVector = function ( src ) {

  this.x /= src.x;
  this.y /= src.y;
  return this;

}

//

window['THREE'].Vector2.prototype.divideScalar = function ( src ) {

  this.x /= src;
  this.y /= src;
  return this;

}

//

window['THREE'].Vector2.prototype.multiplyVector = function ( src ) {

  this.x *= src.x;
  this.y *= src.y;
  return this;

}

//

window['THREE'].Vector2.prototype.multiplyScalar = function ( src ) {

  this.x *= src;
  this.y *= src;
  return this;

}

//

window['THREE'].Vector2.prototype.multiply = function ( src ) {

  return this.multiplyVector( src );

}

//

window['THREE'].Vector2.prototype.div = function ( src ) {

  return this.divideVector( src );

}

//

window['THREE'].Vector2.prototype.mul = function ( src ) {

  return this.multiplyVector( src );

}

//

window['THREE'].Vector2.prototype.subScalar = function ( src ) {

  this[0] -= src;
  this[1] -= src;
  return this;

}

//

window['THREE'].Vector2.prototype.divScalar = function ( src ) {

  return this.divideScalar( src );

}

//

window['THREE'].Vector2.prototype.mulScalar = function ( src ) {

  return this.multiplyScalar( src );

}

//

window['THREE'].Vector2.prototype.random = function () {

  if( arguments.length === 2 )
  {
    this.x = Gutils.randomInRange( arguments[0] );
    this.y = Gutils.randomInRange( arguments[1] );
  }
  else
  {
    this.x = Gutils.randomInRange( arguments[0] );
    this.y = Gutils.randomInRange( arguments[0] );
  }
  return this;

}

//

window['THREE'].Vector2.prototype.abs = function ( src ) {

  this.x = Math.abs( this.x );
  this.y = Math.abs( this.y );
  return this;

}

//

Object.defineProperty( window['THREE'].Vector2.prototype, 0, {
  set : function( src ){ this.setComponent( 0,src ); },
  get : function(){ return this.getComponent( 0 ); },
  enumerable : false,
});
Object.defineProperty( window['THREE'].Vector2.prototype, 1, {
  set : function( src ){ this.setComponent( 1,src ); },
  get : function(){ return this.getComponent( 1 ); },
  enumerable : false,
});
Object.defineProperty( window['THREE'].Vector2.prototype, 2, {
  set : function( src ){ this.setComponent( 2,src ); },
  get : function(){ return this.getComponent( 2 ); },
  enumerable : false,
});

// -- Vector3

window['THREE'].Vector3.prototype.inv = function ( b ) {

  this.x = 1 / this.x;
  this.y = 1 / this.y;
  this.z = 1 / this.z;
  return this;

}

//

window['THREE'].Vector3.prototype.abs = function ( src ) {

  this.x = Math.abs( this.x );
  this.y = Math.abs( this.y );
  this.z = Math.abs( this.z );
  return this;

}

//

window['THREE'].Vector3.prototype.mul = function ( src ) {

  return this.multiply( src );

}

//

window['THREE'].Vector3.prototype.divideVector = function ( src ) {

  return this.divide( src );

}

//

window['THREE'].Vector3.prototype.div = function ( src ) {

  return this.divideVector( src );

}

//

window['THREE'].Vector3.prototype.mulScalar = function ( src ) {

  return this.multiplyScalar( src );

}

//

window['THREE'].Vector3.prototype.divScalar = function ( src ) {

  return this.divideScalar( src );

}

//

window['THREE'].Vector3.prototype.random = function () {

  if( arguments.length === 3 )
  {
    this.x = Gutils.randomInRange( arguments[0] );
    this.y = Gutils.randomInRange( arguments[1] );
    this.z = Gutils.randomInRange( arguments[2] );
  }
  else
  {
    this.x = Gutils.randomInRange( arguments[0] );
    this.y = Gutils.randomInRange( arguments[0] );
    this.z = Gutils.randomInRange( arguments[0] );
  }
  return this;

}

//

Object.defineProperty( window['THREE'].Vector3.prototype, 0, {
  set : function( src ){ this.setComponent( 0,src ); },
  get : function(){ return this.getComponent( 0 ); },
  enumerable : false,
});
Object.defineProperty( window['THREE'].Vector3.prototype, 1, {
  set : function( src ){ this.setComponent( 1,src ); },
  get : function(){ return this.getComponent( 1 ); },
  enumerable : false,
});
Object.defineProperty( window['THREE'].Vector3.prototype, 2, {
  set : function( src ){ this.setComponent( 2,src ); },
  get : function(){ return this.getComponent( 2 ); },
  enumerable : false,
});

// -- color

window['THREE'].Color.prototype.set = function ( value ) {

  if ( value instanceof window['THREE'].Color ) {

    this.copy( value );

  } else if ( typeof value === 'number' ) {

    this.setHex( value );

  } else if ( typeof value === 'string' ) {

    this.setStyle( value );


  } else if ( Gutils.arrayIs( value ) ) {

    this.fromArray( value );

  } else {

    console.log( 'Color.prototype.set : warn : unknown argument' );

  }



  return this;

}

//

window['THREE'].Color.prototype.random = function () {

  if( arguments.length === 3 )
  {
    this.r = Gutils.randomInRange( arguments[0] );
    this.g = Gutils.randomInRange( arguments[1] );
    this.b = Gutils.randomInRange( arguments[2] );
  }
  else if( arguments.length === 0 )
  {
    this.r = Gutils.randomInRange( [0,1] );
    this.g = Gutils.randomInRange( [0,1] );
    this.b = Gutils.randomInRange( [0,1] );
  }
  else
  {
    this.r = Gutils.randomInRange( arguments[0] );
    this.g = Gutils.randomInRange( arguments[0] );
    this.b = Gutils.randomInRange( arguments[0] );
  }
  return this;

}

//

Object.defineProperty( window['THREE'].Color.prototype, 0, {
  set : function( src ){ this.r = src; },
  get : function(){ return this.r; },
  enumerable : false,
});
Object.defineProperty( window['THREE'].Color.prototype, 1, {
  set : function( src ){ this.g = src; },
  get : function(){ return this.g; },
  enumerable : false,
});
Object.defineProperty( window['THREE'].Color.prototype, 2, {
  set : function( src ){ this.b = src; },
  get : function(){ return this.b; },
  enumerable : false,
});
Object.defineProperty( window['THREE'].Color.prototype, 3, {
  set : function( src ){ this.a = src; },
  get : function(){ return this.a; },
  enumerable : false,
});

// -- Face

Object.defineProperty( window['THREE'].Face3.prototype, 0, {
  set : function( src ){ this.a = src; },
  get : function(){ return this.a; },
  enumerable : false,
});
Object.defineProperty( window['THREE'].Face3.prototype, 1, {
  set : function( src ){ this.b = src; },
  get : function(){ return this.b; },
  enumerable : false,
});
Object.defineProperty( window['THREE'].Face3.prototype, 2, {
  set : function( src ){ this.c = src; },
  get : function(){ return this.c; },
  enumerable : false,
});
Object.defineProperty( window['THREE'].Face3.prototype, 3, {
  set : function( src ){ this.d = src; },
  get : function(){ return this.d; },
  enumerable : false,
});


// -- Matrix3

window['THREE'].Matrix3.prototype.rotateAround = function( angle, around )
{
  var c = Math.cos( angle );
  var s = Math.sin( angle );
  var x = (1.0-c)*around.x + s*around.y;
  var y = (1.0-c)*around.y - s*around.x;
  this.multiplyArray
  ([
    +c,  +s, 0.0,
    -s,  +c, 0.0,
    +x,  +y, 1.0
  ]);
  return this;
}

//

window['THREE'].Matrix3.prototype.rotate = function( angle )
{
  var c = Math.cos( angle );
  var s = Math.sin( angle );
  this.multiplyArray
  ([
    +c ,  +s, 0.0,
    -s ,  +c, 0.0,
    0.0, 0.0, 1.0
  ]);
  return this;
}

//

window['THREE'].Matrix3.prototype.scaleAround = function( scale, around )
{
  var x = (1.0-scale.x)*around.x;
  var y = (1.0-scale.y)*around.y;
  this.multiplyArray
  ([
    scale.x, 0.0    , 0.0,
    0.0    , scale.y, 0.0,
    x      , y      , 1.0
  ]);
  return this;
}

//

window['THREE'].Matrix3.prototype.scale = function( scale )
{
  this.multiplyArray
  ([
    scale.x, 0.0    , 0.0,
    0.0    , scale.y, 0.0,
    0.0    , 0.0    , 1.0
  ]);
  return this;
}

//

window['THREE'].Matrix3.prototype.translate = function( src )
{
  this.multiplyArray
  ([
    1.0   , 0.0   , 0.0,
    0.0   , 1.0   , 0.0,
    -src.x, -src.y, 1.0
  ]);
  return this;
}

//

window['THREE'].Matrix3.prototype.multiplyArray = function( src )
{
  var ae = this.elements;
  var be = src;
  var te = this.elements;

  var a11 = ae[0], a12 = ae[3], a13 = ae[6];
  var a21 = ae[1], a22 = ae[4], a23 = ae[7];
  var a31 = ae[2], a32 = ae[5], a33 = ae[8];

  var b11 = be[0], b12 = be[3], b13 = be[6];
  var b21 = be[1], b22 = be[4], b23 = be[7];
  var b31 = be[2], b32 = be[5], b33 = be[8];

  te[0] = a11 * b11 + a12 * b21 + a13 * b31;
  te[3] = a11 * b12 + a12 * b22 + a13 * b32;
  te[6] = a11 * b13 + a12 * b23 + a13 * b33;

  te[1] = a21 * b11 + a22 * b21 + a23 * b31;
  te[4] = a21 * b12 + a22 * b22 + a23 * b32;
  te[7] = a21 * b13 + a22 * b23 + a23 * b33;

  te[2] = a31 * b11 + a32 * b21 + a33 * b31;
  te[5] = a31 * b12 + a32 * b22 + a33 * b32;
  te[8] = a31 * b13 + a32 * b23 + a33 * b33;

  return this;
}

//

window['THREE'].Matrix3.prototype.multiply = function( src )
{
  this.multiplyMatrices( this,src );
  return this;
}

//

window['THREE'].Matrix3.prototype.mul = function( src )
{
  return this.multiply( src );
}

//

window['THREE'].Matrix3.prototype.multiplyMatrices = function( a,b )
{
  var ae = a.elements;
  var be = b.elements;
  var te = this.elements;

  var a11 = ae[0], a12 = ae[3], a13 = ae[6];
  var a21 = ae[1], a22 = ae[4], a23 = ae[7];
  var a31 = ae[2], a32 = ae[5], a33 = ae[8];

  var b11 = be[0], b12 = be[3], b13 = be[6];
  var b21 = be[1], b22 = be[4], b23 = be[7];
  var b31 = be[2], b32 = be[5], b33 = be[8];

  te[0] = a11 * b11 + a12 * b21 + a13 * b31;
  te[3] = a11 * b12 + a12 * b22 + a13 * b32;
  te[6] = a11 * b13 + a12 * b23 + a13 * b33;

  te[1] = a21 * b11 + a22 * b21 + a23 * b31;
  te[4] = a21 * b12 + a22 * b22 + a23 * b32;
  te[7] = a21 * b13 + a22 * b23 + a23 * b33;

  te[2] = a31 * b11 + a32 * b21 + a33 * b31;
  te[5] = a31 * b12 + a32 * b22 + a33 * b32;
  te[8] = a31 * b13 + a32 * b23 + a33 * b33;

  return this;
}

// -- matrix4

window['THREE'].Matrix4.prototype.mul = function( src )
{
  return this.multiply( src );
}

// -- object 3d

window['THREE'].Object3DIdCount++;
window['THREE'].Object3D.prototype.objects = [];
_Object3DInit = window['THREE'].Object3D.prototype.init;
window['THREE'].Object3D.prototype.init = function () {

  var result = _Object3DInit.apply( this,arguments );
  window['THREE'].Object3D.prototype.objects[this.id] = this;
  return result;

}

//

window['THREE'].Object3D.prototype.dispose = function(){

  this.dispatchEvent( { type: 'dispose' } );
  delete window['THREE'].Object3D.prototype.objects[this.id];

}

//

window['THREE'].Object3D.prototype.setRecursive = function( map ){

  for( var m in map )
  this[m] = map[m];
  this.traverse( function( node ) {
    for( var m in map )
    node[m] = map[m];
  });

}

//

window['THREE'].Object3D.prototype.addObjects = function ( objects ) {

  if( Gutils.arrayIs( objects ) )
  {
    for( var o = 0 ; o < objects.length ; o++ )
    {
      if( objects[o] === undefined ) throw ['Object3D.prototype.addObjects bad object',objects[o]]
      this.add( objects[o] );
    }
  }
  else if( Gutils.objectIs( objects ) )
  {
    for( var o in objects )
    {
      if( objects[o] === undefined ) throw ['Object3D.prototype.addObjects bad object',objects[o]]
      this.add( objects[o] );
    }
  }
  else this.add( objects );

}

//

window['THREE'].Object3D.prototype.removeObjectsAll = function ( objects,dispose ) {

  var self = this;
  for( var c = self.children.length ; c >= 0 ; c-- )
  self.remove( self.children[c] );

}

//

window['THREE'].Object3D.prototype.removeObjects = function ( objects,dispose ) {

  if( Gutils.arrayIs( objects ) )
  {
    for( var o = 0 ; o < objects.length ; o++ )
    {
      if( objects[o] === undefined ) throw ['Object3D.removeObjects bad object',objects[o]];
      this.remove( objects[o] );
      if( dispose ) objects[o].dispose();
    }
  }
  else this.remove( objects );

}

//

window['THREE'].Object3D.prototype.visibleSet = function( visible,drawableOnly ) {

  visible = visible ? true : false;
  this._visible = visible;
  this._visibleWas = visible;

  if( visible )
  {
    this.traverse( function( node ) {
      if( drawableOnly )
      {
        if( node instanceof window['THREE'].Camera ) return;
        if( node instanceof window['THREE'].Light ) return;
      }
      if( node._visibleWas !== undefined ) node._visible = node._visibleWas
      delete node._visibleWas;
    });
  }
  else
  {
    this.traverse( function( node ) {
      if( drawableOnly )
      {
        if( node instanceof window['THREE'].Camera ) return;
        if( node instanceof window['THREE'].Light ) return;
      }
      if( node._visibleWas === undefined ) node._visibleWas = node._visible;
      node._visible = false;
    });
  }
}

//

window['THREE'].Object3D.prototype.visibleGet = function() {

  if( this._visible === undefined ) return true;
  return this._visible;

}

//

Object.defineProperty( window['THREE'].Object3D.prototype, 'visible', {
  set : window['THREE'].Object3D.prototype.visibleSet,
  get : window['THREE'].Object3D.prototype.visibleGet,
  enumerable : true,
});

// -- Mesh

_MeshInit = window['THREE'].Mesh.prototype.init;
window['THREE'].Mesh.prototype.init = function () {

  this.materials = {};
  _MeshInit.apply( this,arguments );
  return this;

}

//

window['THREE'].Mesh.prototype.materialSet = function( src ) {

  this.materials['default'] = src;

}

//

window['THREE'].Mesh.prototype.materialGet = function() {

  return this.materials['default'];

}

//

window['THREE'].Mesh.prototype.clone = function ( object,recursive ) {

  if ( object === undefined ) object = new window['THREE'].Mesh( this.geometry, this.material );
  window['THREE'].Object3D.prototype.clone.call( this, object, recursive );
  return object;

};

//

Object.defineProperty( window['THREE'].Mesh.prototype, 'material', {
  set : window['THREE'].Mesh.prototype.materialSet,
  get : window['THREE'].Mesh.prototype.materialGet,
  enumerable : true,
});

// -- WebGLRenderer

_WebGLRenderer = window['THREE'].WebGLRenderer;
window['THREE'].WebGLRenderer = function(){

  this.materials = {};
  this.materials['select'] = new window['THREE'].MeshBasicMaterial({
    color: 0xffffff,
    blending: window['THREE'].NoBlending
  });
  return _WebGLRenderer.apply( this,arguments );

}

//

window['THREE'].WebGLRenderer.prototype.invalidate = function( scene,object ){

  this.invalidateObject_( object,scene );
  scene.__objectsAdded.push( object );
  delete object.__webglInit;
  delete object.__webglActive;

  if( object.geometry )
  {
    delete object.geometry.__webglInit;
  }
}

//

window['THREE'].WebGLRenderer.prototype.setColorWithObject = function( color,object ) {

  var id = object.id;
  Gutils.packIntToFloat4( color,id );

}

//

window['THREE'].WebGLRenderer.prototype.getObjectWithColor = function( color ) {

  var id = Gutils.packInt4ToInt( color );
  //console.log( 'id',id );
  return window['THREE'].Object3D.prototype.objects[id];

}

//

window['THREE'].WebGLRenderer.prototype.unrollImmediateBufferMaterial = function( globject ) {

  var object = globject.object,
    material = object.material;

  if ( material['transparent'] ) {

    globject['transparent'] = material;
    globject['opaque'] = null;
    globject['select'] = this.materials['select'];
    //globject['select'] = object.materials['select'];

  } else {

    globject['opaque'] = material;
    globject['transparent'] = null;
    globject['select'] = this.materials['select'];
    //globject['select'] = object.materials['select'];

  }

};

//

window['THREE'].WebGLRenderer.prototype.unrollBufferMaterial = function( globject ) {

  var object = globject.object,
    buffer = globject.buffer,
    material, materialIndex, meshMaterial;

  meshMaterial = object.material;

  if ( meshMaterial instanceof window['THREE'].MeshFaceMaterial ) {

    materialIndex = buffer.materialIndex;

    material = meshMaterial.materials[ materialIndex ];

    if ( material['transparent'] ) {

      globject['transparent'] = material;
      globject['opaque'] = null;
      globject['select'] = this.materials['select'];

    } else {

      globject['opaque'] = material;
      globject['transparent'] = null;
      globject['select'] = this.materials['select'];

    }

  } else {

    material = meshMaterial;

    if ( material ) {

      if ( material['transparent'] ) {

        globject['transparent'] = material;
        globject['opaque'] = null;
        globject['select'] = this.materials['select'];

      } else {

        globject['opaque'] = material;
        globject['transparent'] = null;
        globject['select'] = this.materials['select'];

      }

    }

  }

}


// -- BufferGeometry

window['THREE'].BufferGeometry.prototype.addAttribute = function ( name,attr ) {

  if( this.attributes[ name ] )
  {
    var attrWas = this.attributes[ name ];
    if( attrWas.itemSize == attr.itemSize && attrWas.array.length == attr.array.length /*&& attr instanceof type*/ )
    {
      console.warn( 'BufferGeometry.addAttribute: untested feature' );
      return attr;
    }
    delete( this.attributes[ name ].array );
  }

  if ( attr instanceof THREE.BufferAttribute === false ) {

    console.warn( 'DEPRECATED: BufferGeometry\'s addAttribute() now expects ( name, attr ).' );

    this.attributes[ name ] = { array: arguments[ 1 ], itemSize: arguments[ 2 ] };

    return;

  }

  this.attributes[ name ] = attr;

},
/*
window['THREE'].BufferGeometry.prototype.addAttribute = function ( name, type, numItems, itemSize ) {

  if( this.attributes[ name ] )
  {
    var attr = this.attributes[ name ];
    if( attr.itemSize == itemSize && attr.array.length == numItems && attr instanceof type )
    {
      xxx
      return attr;
    }
    delete( this.attributes[ name ].array );
  }

  this.attributes[ name ] = {

    array: new type( numItems * itemSize ),
    itemSize: itemSize

  };

  return this.attributes[ name ];

}
*/
//

window['THREE'].BufferGeometry.prototype.computeNormalsWithoutIndices = function(){

  if( !this.attributes[ "position" ] ) return;

  var i, il;
  var j, jl;

  var nVertexElements = this.attributes[ "position" ].array.length;

  if ( this.attributes[ "normal" ] === undefined ) {

    this.attributes[ "normal" ] = {

      itemSize: 3,
      array: new Float32Array( nVertexElements )

    };

  } else {

    // reset existing normals to zero

    for ( i = 0, il = this.attributes[ "normal" ].array.length; i < il; i ++ ) {

      this.attributes[ "normal" ].array[ i ] = 0;

    }

  }

  var positions = this.attributes[ "position" ].array;
  var normals = this.attributes[ "normal" ].array;

  var vA, vB, vC, x, y, z,

  pA = new window['THREE'].Vector3(),
  pB = new window['THREE'].Vector3(),
  pC = new window['THREE'].Vector3(),

  cb = new window['THREE'].Vector3(),
  ab = new window['THREE'].Vector3();

  for ( i = 0, il = positions.length; i < il; i += 9 ) {

    x = positions[ i + 0 ];
    y = positions[ i + 1 ];
    z = positions[ i + 2 ];
    pA.set( x, y, z );

    x = positions[ i + 3 ];
    y = positions[ i + 4 ];
    z = positions[ i + 5 ];
    pB.set( x, y, z );

    x = positions[ i + 6 ];
    y = positions[ i + 7 ];
    z = positions[ i + 8 ];
    pC.set( x, y, z );

    cb.subVectors( pC, pB );
    ab.subVectors( pA, pB );
    cb.cross( ab );

    normals[ i + 0 ] = cb.x;
    normals[ i + 1 ] = cb.y;
    normals[ i + 2 ] = cb.z;

    normals[ i + 3 ] = cb.x;
    normals[ i + 4 ] = cb.y;
    normals[ i + 5 ] = cb.z;

    normals[ i + 6 ] = cb.x;
    normals[ i + 7 ] = cb.y;
    normals[ i + 8 ] = cb.z;

  }

  this.normalizeNormals();
  this.normalsNeedUpdate = true;

}

//

window['THREE'].BufferGeometry.prototype.computeFaceNormals = function(){

  xxx
  var self = this;
  if( !this.attributes[ "position" ] ) return;

  var i, il;
  var j, jl;

  var nVertexElements = this.attributes[ "position" ].array.length;

  if ( this.attributes[ "normal" ] === undefined ) {

    this.attributes[ "normal" ] = {

      itemSize: 3,
      array: new Float32Array( nVertexElements )

    };

  } else {

    // reset existing normals to zero

    for ( i = 0, il = this.attributes[ "normal" ].array.length; i < il; i ++ ) {

      this.attributes[ "normal" ].array[ i ] = 0;

    }

  }

  var positions = this.attributes[ "position" ].array;
  var normals = this.attributes[ "normal" ].array;

  var l = positions.length / 3;
  var vA, vB, vC, x, y, z,

  pA = new window['THREE'].Vector3(),
  pB = new window['THREE'].Vector3(),
  pC = new window['THREE'].Vector3(),

  cb = new window['THREE'].Vector3(),
  ab = new window['THREE'].Vector3();

  //

  var getUnique = function( indexOffset,indexPosition )
  {
    var i = indexOffset + indices[indexPosition];
    //return i;
    if( ( normals[i * 3 + 0] != 0 ) || ( normals[i * 3 + 1] != 0 ) || ( normals[i * 3 + 2] != 0 ) )
    {
      l++;
      if( (l*3-1) > positions.length )
      {
        var newLen = positions.length*2;
        self.attributes[ "position" ].array = Gutils.arrayBufferRelen( positions,newLen );
        self.attributes[ "normal" ].array = Gutils.arrayBufferRelen( normals,newLen );
        positions = self.attributes[ "position" ].array;
        normals = self.attributes[ "normal" ].array;
      }

      normals[l*3-3] = normals[i*3+0];
      normals[l*3-2] = normals[i*3+1];
      normals[l*3-1] = normals[i*3+2];

      positions[l*3-3] = positions[i*3+0];
      positions[l*3-2] = positions[i*3+1];
      positions[l*3-1] = positions[i*3+2];

      indices[indexPosition] = l - 1 - indexOffset;
      return l-1;
    }
    return i;
  }

  // indexed elements

  if ( this.attributes[ "index" ] ) {

    var indices = this.attributes[ "index" ].array;
    var offsets = this.offsets;

    for ( j = 0, jl = offsets.length; j < jl; ++ j ) {

      var start = offsets[ j ].start;
      var count = offsets[ j ].count;
      var index = offsets[ j ].index;

      //for ( i = start, il = start + count; i < il; i += 3 ) {
      for ( i = start, il = start + count; i < il; i += 3 ) {

        //vA = index + indices[ i + 0 ];
        //vB = index + indices[ i + 1 ];
        //vC = index + indices[ i + 2 ];

        vA = getUnique( index,i+0 );
        vB = getUnique( index,i+1 );
        vC = getUnique( index,i+2 );

        x = positions[ vA * 3 + 0 ];
        y = positions[ vA * 3 + 1 ];
        z = positions[ vA * 3 + 2 ];
        pA.set( x, y, z );

        x = positions[ vB * 3 + 0 ];
        y = positions[ vB * 3 + 1 ];
        z = positions[ vB * 3 + 2 ];
        pB.set( x, y, z );

        x = positions[ vC * 3 + 0 ];
        y = positions[ vC * 3 + 1 ];
        z = positions[ vC * 3 + 2 ];
        pC.set( x, y, z );

        cb.subVectors( pC, pB );
        ab.subVectors( pA, pB );
        cb.cross( ab );

        normals[ vA * 3 + 0 ] = cb.x;
        normals[ vA * 3 + 1 ] = cb.y;
        normals[ vA * 3 + 2 ] = cb.z;

        normals[ vB * 3 + 0 ] = cb.x;
        normals[ vB * 3 + 1 ] = cb.y;
        normals[ vB * 3 + 2 ] = cb.z;

        normals[ vC * 3 + 0 ] = cb.x;
        normals[ vC * 3 + 1 ] = cb.y;
        normals[ vC * 3 + 2 ] = cb.z;

      }

    }

    if( l < positions.length )
    {
      var newLen = l*3;
      this.attributes[ "position" ].array = Gutils.arrayBufferRelen( positions,newLen );
      this.attributes[ "normal" ].array = Gutils.arrayBufferRelen( normals,newLen );
    }

  } else {

    this.computeNormalsWithoutIndices();

  }

  this.normalizeNormals();
  this.normalsNeedUpdate = true;

}

//

window['THREE'].BufferGeometry.prototype.computeVertexNormals = function(){

  xxx
  if( !this.attributes[ "position" ] ) return;

  var i, il;
  var j, jl;

  var nVertexElements = this.attributes[ "position" ].array.length;

  if ( this.attributes[ "normal" ] === undefined ) {

    this.attributes[ "normal" ] = {

      itemSize: 3,
      array: new Float32Array( nVertexElements )

    };

  } else {

    // reset existing normals to zero

    for ( i = 0, il = this.attributes[ "normal" ].array.length; i < il; i ++ ) {

      this.attributes[ "normal" ].array[ i ] = 0;

    }

  }

  var positions = this.attributes[ "position" ].array;
  var normals = this.attributes[ "normal" ].array;

  var vA, vB, vC, x, y, z,

  pA = new window['THREE'].Vector3(),
  pB = new window['THREE'].Vector3(),
  pC = new window['THREE'].Vector3(),

  cb = new window['THREE'].Vector3(),
  ab = new window['THREE'].Vector3();

  // indexed elements

  if ( this.attributes[ "index" ] ) {

    var indices = this.attributes[ "index" ].array;

    var offsets = this.offsets;

    for ( j = 0, jl = offsets.length; j < jl; ++ j ) {

      var start = offsets[ j ].start;
      var count = offsets[ j ].count;
      var index = offsets[ j ].index;

      //for ( i = start, il = 1; i < il; i += 3 ) {
      for ( i = start, il = start + count; i < il; i += 3 ) {

        vA = index + indices[ i ];
        vB = index + indices[ i + 1 ];
        vC = index + indices[ i + 2 ];

        x = positions[ vA * 3 ];
        y = positions[ vA * 3 + 1 ];
        z = positions[ vA * 3 + 2 ];
        pA.set( x, y, z );

        x = positions[ vB * 3 ];
        y = positions[ vB * 3 + 1 ];
        z = positions[ vB * 3 + 2 ];
        pB.set( x, y, z );

        x = positions[ vC * 3 ];
        y = positions[ vC * 3 + 1 ];
        z = positions[ vC * 3 + 2 ];
        pC.set( x, y, z );

        cb.subVectors( pC, pB );
        ab.subVectors( pA, pB );
        cb.cross( ab );

        normals[ vA * 3 + 0 ] += cb.x;
        normals[ vA * 3 + 1 ] += cb.y;
        normals[ vA * 3 + 2 ] += cb.z;

        normals[ vB * 3 + 0 ] += cb.x;
        normals[ vB * 3 + 1 ] += cb.y;
        normals[ vB * 3 + 2 ] += cb.z;

        normals[ vC * 3 + 0 ] += cb.x;
        normals[ vC * 3 + 1 ] += cb.y;
        normals[ vC * 3 + 2 ] += cb.z;

      }

    }
  } else {

    this.computeNormalsWithoutIndices();

  }

  this.normalizeNormals();
  this.normalsNeedUpdate = true;

}
