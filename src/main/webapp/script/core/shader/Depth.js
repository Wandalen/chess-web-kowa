ShaderDepth = {

  uniforms: {

    "mNear": { type: "f", value: 1.0 },
    "mFar" : { type: "f", value: 2000.0 },
    "opacity" : { type: "f", value: 1.0 }

  },

  vertexShader: [

    THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
    THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],

    "void main() {",

      THREE.ShaderChunk[ "morphtarget_vertex" ],
      THREE.ShaderChunk[ "default_vertex" ],
      THREE.ShaderChunk[ "logdepthbuf_vertex" ],

    "}"

  ].join("\n"),

  fragmentShader: [

    "uniform float mNear;",
    "uniform float mFar;",
    "uniform float opacity;",

    "vec4 packDepth( const in float depth ) {",

      "vec4 result;",
      "result.r = fract( depth );",
      "result.g = fract( depth * 256.0 + 0.5 );",
      "result.b = fract( depth * 65536.0 + 0.1125 );",
      "result.a = fract( depth * 16777216.0 + 0.0 );",
      //"result.a = 0.0;",
      "return result;",

    "	}",

    "vec4 packDepth_( const in float depth ) {",

      "vec4 result;",
      "result.r = fract( depth / 65536.0 );",
      "result.g = fract( depth / 256.0 );",
      "result.b = fract( depth );",
      "result.a = fract( depth * 256.0 + 0.5 );",
      "result.a = 0.0;",
      "return result;",

    "	}",

    THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],

    "void main() {",

      THREE.ShaderChunk[ "logdepthbuf_fragment" ],

    "#ifdef USE_LOGDEPTHBUF_EXT",

      //"float depth = gl_FragDepthEXT / gl_FragCoord.w;",
      "float depth = gl_FragDepthEXT;",

    "#else",

      //"float depth = gl_FragCoord.z / gl_FragCoord.w;",
      "float depth = gl_FragCoord.z;",

    "#endif",

    "float d = (2.0 * depth - 0.0 - 1.0*0.999) / (1.0);",
    "gl_FragColor = packDepth( d );",

    "}"

  ].join("\n")

}