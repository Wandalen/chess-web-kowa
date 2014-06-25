(function(){

//

var sign = function( src ) {
  return src < 0 ? -1 : +1;
}

// -- prototype

if( typeof Gutils === 'undefined' ) Gutils = {};
Gutils.mapExtend( Gutils,{

  sign: sign,

});

})();