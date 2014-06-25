ChessPlayer = function() {
  arguments.callee.prototype.init.apply( this,arguments );
};

(function(){

// -- var
var Self = ChessPlayer;
//var model = {};

var STATE_DEFAULT =
{
  "1a" :
  {
    "owner" : "White",
    "type" : "r1"
  },
  "1b" :
  {
    "owner" : "White",
    "type" : "n1"
  },
  "1c" :
  {
    "owner" : "White",
    "type" : "b1"
  },
  "1d" :
  {
    "owner" : "White",
    "type" : "q"
  },
  "1e" :
  {
    "owner" : "White",
    "type" : "k"
  },
  "1f" :
  {
    "owner" : "White",
    "type" : "b2"
  },
  "1g" :
  {
    "owner" : "White",
    "type" : "n2"
  },
  "1h" :
  {
    "owner" : "White",
    "type" : "r2"
  },

  "2a" :
  {
    "owner" : "White",
    "type" : "p1"
  },
  "2b" :
  {
    "owner" : "White",
    "type" : "p2"
  },
  "2c" :
  {
    "owner" : "White",
    "type" : "p3"
  },
  "2d" :
  {
    "owner" : "White",
    "type" : "p4"
  },
  "2e" :
  {
    "owner" : "White",
    "type" : "p5"
  },
  "2f" :
  {
    "owner" : "White",
    "type" : "p6"
  },
  "2g" :
  {
    "owner" : "White",
    "type" : "p7"
  },
  "2h" :
  {
    "owner" : "White",
    "type" : "p8"
  },

  "8a" :
  {
    "owner" : "Black",
    "type" : "r1"
  },
  "8b" :
  {
    "owner" : "Black",
    "type" : "n1"
  },
  "8c" :
  {
    "owner" : "Black",
    "type" : "b1"
  },
  "8d" :
  {
    "owner" : "Black",
    "type" : "q"
  },
  "8e" :
  {
    "owner" : "Black",
    "type" : "k"
  },
  "8f" :
  {
    "owner" : "Black",
    "type" : "b2"
  },
  "8g" :
  {
    "owner" : "Black",
    "type" : "n2"
  },
  "8h" :
  {
    "owner" : "Black",
    "type" : "r2"
  },

  "7a" :
  {
    "owner" : "Black",
    "type" : "p1"
  },
  "7b" :
  {
    "owner" : "Black",
    "type" : "p2"
  },
  "7c" :
  {
    "owner" : "Black",
    "type" : "p3"
  },
  "7d" :
  {
    "owner" : "Black",
    "type" : "p4"
  },
  "7e" :
  {
    "owner" : "Black",
    "type" : "p5"
  },
  "7f" :
  {
    "owner" : "Black",
    "type" : "p6"
  },
  "7g" :
  {
    "owner" : "Black",
    "type" : "p7"
  },
  "7h" :
  {
    "owner" : "Black",
    "type" : "p8"
  }
}

//

var init = function( options ) {

  var self = this;
  options = options || {};
  Gutils.mapExtend( self,options );

  if( !self.id ) self.id = 'White';
  if( !self.model ) self.model = {};
  if( !self.color ) self.color = 0xffffff;
  if( !self.orbital ) self.orbital = {};

  if( !self.chess ) throw "chess/Player.js: No Chess object";

  self.chessman = {};
  self.initMaterial();

}

//

var initMaterial = function(){

  var self = this;

  var parameters = {
    ambient: 0x000000,
    color: 0xffffff,
    specular: 0x333333,
    shiness: 1,

    map: self.map,
    bumpMap: self.bumpMap,
    bumpScale: 5,
  };

  parameters.color = self.color;

  self.material = new THREE.MeshPhongMaterial( parameters );
  self.material.colorOriginal = self.material.color.clone();

}

//

var applyState = function( state ) {

  var self = this;

  for( var c in self.chessman )
  {
    var chessman = self.chessman[c];
    chessman.object.visible = false;
    if( chessman.cell ) delete chessman.cell.chessman;
    delete chessman.cell;
  }

  var used = {};

  for( var s in state )
  {
    if( !Gutils.objectIs( state[s] ) ) continue;
    if( state[s]['owner'] !== self.id ) continue;

    var t = {};
    self.chess.typeWithCode( t,state[s]['type'] );
    while( used[t.code] )
    {
      t.number++;
      t.code = t.type + t.number;
    }

    var chessman = self.chessman[t.code];
    if( !chessman )
    {
      chessman = new Chessman({ chess: self.chess, player: self, code: t.code });
      self.chessman[t.code] = chessman;
    }

    self.chess.cell[s].chessman = chessman;
    chessman.cell = self.chess.cell[s];

    chessman.move( s,1 );
    used[t.code] = chessman;

  }

}

//

Self.prototype = {

  // -- constructor
  init: init,
  initMaterial: initMaterial,

  // --
  applyState :applyState,
  //applyValidMoves: applyValidMoves,

  // -- var
  STATE_DEFAULT: STATE_DEFAULT


}

})();