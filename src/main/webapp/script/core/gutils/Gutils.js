(function(){

// -- var

var EPS = 0.000001;
var EPS2 = EPS*EPS;
var SQRT2 = 1.4142135623730950488016887242097;

// -- meta

var clone = function( src,depth,silent )
{
  var result;
  if( !src ) return src;
  if( depth === undefined ) depth = 16;
  if( depth < 0 )
  {
    if( silent ) console.log( 'Gutils.clone: overflow' );
    else throw 'Gutils.clone: overflow';
  }

  var type = Object.prototype.toString.call( src );
  var types =
  {
    '[object Number]' : Number,
    '[object String]' : String,
    '[object Boolean]' : Boolean,
    '[object Date]' : Date
  };
  if( types[type] !== undefined )
    result = types[type]( src );

  if( result === undefined )
  {
    if( arrayIs( src ) )
    {
      result = [];
      src.forEach(function( child, index, array ) {
        result[index] = clone( child,depth-1,silent );
      });
    }
    else if( typeof src == "object" )
    {
      if( src.nodeType && typeof src.cloneNode == "function" )
      {
        result = src.cloneNode( true );
      }
      else if( !src.prototype )
      {
        result = {};
        var proto = Object.getPrototypeOf( src );
        if( len( proto ) )
        {
          function Result(){};
          Result.prototype = proto;
          result = new Result();
        }
        for( var s in src )
        {
          result[s] = clone( src[s],depth-1,silent );
        }
      }
      else
      {
        result = src;
      }
    } else {
      result = src;
    }
  }

  return result;
}

//

var objectClone = function( src ){

  var result = {};
  for( var s in src )
  {
    result[s] = src[s];
  }
  return result;

}

//

var len = function( src ) {
  if( src === undefined ) return 0;
  if( src.length !== undefined ) return src.length;
  else if( objectIs( src ) ) return Object.keys( src ).length;
  else return 1;
}


// -- type test

var mapIs = function( src ) {
  for( e in src ) return true;
  return false;
}

var htmlIs = function( src ) {
  return Object.prototype.toString.call( src ).indexOf( '[object HTML' ) !== -1;
}

var objectIs = function( src ) {
  return Object.prototype.toString.call( src ) === '[object Object]';
}

var stringIs = function( src ) {
  return Object.prototype.toString.call( src ) === '[object String]';
}

var numberIs = function( src ) {
  return Object.prototype.toString.call( src ) === '[object Number]';
}

var dateIs = function( src ) {
  return Object.prototype.toString.call( src ) === '[object Date]';
}

var arrayIs = function( src ) {
  return Object.prototype.toString.call( src ) === '[object Array]';
}

var boolIs = function( src ) {
  return Object.prototype.toString.call( src ) === '[object Boolean]';
}

var routineIs = function( src ) {
  return Object.prototype.toString.call( src ) === '[object Function]';
}

var jqueryIs = function( src ) {
  return src instanceof $;
}

// -- map

var mapExtend = function( dst,def,cloneArray ) {

  var result = dst;

  for( s in def )
  //if( result[s] === undefined )
  {
    if( cloneArray && Gutils.arrayIs( def[s] ) ) result[s] = def[s].slice( 0 );
    else result[s] = def[s];
  }

  return result;
}

//

var mapSupplementInplace = function( dst,def,cloneArray ) {

  var result = dst;

  for( s in def )
  if( result[s] === undefined )
  {
    if( cloneArray && Gutils.arrayIs( def[s] ) ) result[s] = def[s].slice( 0 );
    else result[s] = def[s];
  }

  return result;
}

// -- prototype

if( typeof Gutils === 'undefined' ) Gutils = {};

mapExtend( Gutils,{

  // -- meta
  clone: clone,
  objectClone: objectClone,
  len: len,

  // -- type test
  mapIs: mapIs,
  htmlIs: htmlIs,
  objectIs: objectIs,
  stringIs: stringIs,
  arrayIs: arrayIs,
  numberIs: numberIs,
  dateIs: dateIs,
  boolIs: boolIs,
  routineIs: routineIs,
  jqueryIs: jqueryIs,

  // -- map
  mapExtend: mapExtend,
  mapSupplementInplace: mapSupplementInplace,

  // -- var
  EPS: EPS,
  EPS2: EPS2,
  SQRT2: SQRT2,

});

utils = Gutils;

})();

if( typeof module !== 'undefined' ) module.exports = Gutils;
if( typeof window !== 'undefined' )
{
  window['Gutils'] = Gutils;
}