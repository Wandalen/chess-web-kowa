(function(){

//

var nodeDump = function( node,tab ) {
  var node = node ? node : this.node;
  var tab = tab ? tab : '';

  result = '';
  result += tab + 'proto: ' + getNameOfThreeClass( node ) + "\n";
  //if( node.name )
  //console.log( node.name );

  //

  if( node.name ) result += tab + 'name: ' + node.name + "\n";
  if( node.id ) result += tab + 'id: ' + node.id + "\n";
  if( node.visible !== undefined ) result += tab + 'visible: ' + node.visible + "\n";
  if( node.geometry ) result += tab + 'geometry: ' + getNameOfThreeClass(node.geometry) + '( ' + (node.geometry.name ? node.geometry.name : node.geometry.id) + " )\n";
  if( node.material )
  {
    if( Gutils.arrayIs( node.material ) ) result += tab + 'material: ' + getNameOfThreeClass(node.material) + '( many )\n';
    else result += tab + 'material: ' + getNameOfThreeClass(node.material) + '( ' + (node.material.name ? node.material.name : node.material.id) + " )\n";
  }
  result += tab + 'position: ' + node.position.x + " " + node.position.y + " " + node.position.z + "\n";
  result += tab + 'rotation: ' + node.rotation.x + " " + node.rotation.y + " " + node.rotation.z + "\n";
  result += tab + 'scale: ' + node.scale.x + " " + node.scale.y + " " + node.scale.z + "\n";

  result += tab + 'frustumCulled: ' + node.frustumCulled + '\n';

  //result += tab + 'matrix: ' + Gutils.toStrFine( node.matrix,tab ) + "\n";
  //result += tab + 'matrixWorld: ' + Gutils.toStrFine( node.matrixWorld,tab ) + "\n";

  result += tab + '' + "\n";

  //

  for( childId in node.children ) {
    child = node.children[ childId ];
    result += this.nodeDump( child,tab + '  ' );
  }

  return result;
}

// -- prototype

if( typeof Gutils === 'undefined' ) Gutils = {};
Gutils.mapExtend( Gutils,{

  // -- simple
  nodeDump: nodeDump,

});

})();