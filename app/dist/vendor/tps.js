(function(){
var Module = {};

function ThinPlateSpline(options) {
  if (!options) { options = {}; }

  var obj_size = Module.ccall('_ZN17VizGeorefSpline2D15get_object_sizeEv', 'number', [], []);

  this.__ord = {
    pointer : Runtime.stackAlloc(obj_size),
    solved  : false
  };
  this.__rev = {
    pointer : Runtime.stackAlloc(obj_size),
    solved  : false
  };
  this.isWorker = false;
  var me     = this;

  Module.ccall('_ZN17VizGeorefSpline2DC2Ei', 'void', ['number', 'number'], [this.__ord.pointer, 2]);
  Module.ccall('_ZN17VizGeorefSpline2DC2Ei', 'void', ['number', 'number'], [this.__rev.pointer, 2]);

  if (options.use_worker) {
    var root = '';
    var scripts = document.getElementsByTagName("script");
    var i = scripts.length;
    var min = '';
    while (i--) {
      var match = scripts[i].src.match(/(^|.*\/)tps(\.min)?\.js/);
      if (match) {
        root = match[1];
        min  = match[2];
        if (min === undefined) min = "";
        break;
      }
    }

    var worker = this.worker = new Worker(root + 'tps' + min + '.js');

    worker.onmessage = function(e) {
      var data      = e.data;
      var e_type    = data.event;

      switch (e_type){
        case 'solved':
          worker.postMessage({'method':'serialize'});
          break;
        case 'serialized':
          var serial = data.serial;
          delete(me.worker);
          worker.terminate();
          me.deserialize(serial);
          break;
        case 'echo':
          console.log(data.data);
      }
    };
  }

  if (options.transform_callback) {
    this.transform_callback = options.transform_callback;
  }

  if (options.error_callback) {
    this.error_callback = options.error_callback;
  }

  if (options.web_falback && options.transform_callback) {
    this.web_fallback = options.web_falback;
  }
}

ThinPlateSpline.prototype.destructor = function() {
  Module.ccall('_ZN17VizGeorefSpline2DD2Ev', 'void', ['number'], [this.__ord.pointer]);
  Module.ccall('_ZN17VizGeorefSpline2DD2Ev', 'void', ['number'], [this.__rev.pointer]);
  Module.ccall('_ZdlPv', 'void', ['number'], [this.__ord.pointer]);
  Module.ccall('_ZdlPv', 'void', ['number'], [this.__rev.pointer]);
};

ThinPlateSpline.prototype.push_points = function(points) {
  if (this.worker) {
    this.worker.postMessage({'method':'push_points','data':points});
  } else {
    for (var i=0,len=points.length;i<len;i++) {
      var point = points[i];
      this.add_point(point[0],point[1]);
    }
    this.solve();
  }
};

ThinPlateSpline.prototype.load_points = function(url) {
  var me = this;
  if (this.worker) {
    this.worker.postMessage({'method':'load_points','data':url});
  } else {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onload = function(e) {
      if (this.status == 200) {
        var points = JSON.parse(this.response);
        me.push_points(points);
      } else {
        //self.postMessage({'event':'cannotLoad'});
      }
    };
    xhr.send();
  }
};

ThinPlateSpline.prototype.load_serial = function(url) {
  var me = this;
  if (this.worker) {
    this.worker.postMessage({'method':'load_serial','data':url});
  } else {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function(e) {
      if (this.status == 200) {
        var serial = new Uint8Array(this.response);
        me.deserialize(serial);
      } else {
        //self.postMessage({'event':'cannotLoad'});
      }
    };
    xhr.send();
  }
};

ThinPlateSpline.prototype.add_point = function(P, D) {
  this.__add_point(this.__ord, P, D);
  this.__add_point(this.__rev, D, P);
};

ThinPlateSpline.prototype.__add_point = function(self, P, D) {
  var DPtr = _malloc(16);
  Module.setValue(DPtr,     D[0], 'double');
  Module.setValue(DPtr + 8, D[1], 'double');
  var ret = Module['ccall']('_ZN17VizGeorefSpline2D9add_pointEddPKd', 'number', ['number','number','number','number'], [self.pointer, P[0], P[1], DPtr]);

  _free(DPtr);

  self.solved = false;

  return ret;
};

ThinPlateSpline.prototype.solve = function() {
  this.__solve(this.__ord);
  this.__solve(this.__rev);
};

ThinPlateSpline.prototype.__solve = function(self) {
  self.solved = true;
  return Module.ccall('_ZN17VizGeorefSpline2D5solveEv', 'number', ['number'], [self.pointer]);
};

ThinPlateSpline.prototype.transform = function(P, isRev) {
  var self = isRev ? this.__rev : this.__ord;
  var ret  = this.__get_point(self, P);
  var me   = this;

  if (me.transform_callback) {
    if (ret === 0) {
      if (me.web_fallback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', this.web_fallback + '?x=' + P[0] + '&y=' + P[1] + '&inv=' + isRev, true);

        xhr.onload = function(e) {
          if (this.status == 200) {
            var data = JSON.parse(this.response);
            me.transform_callback([data.data.x,data.data.y], isRev);
          } else if (me.error_callback) {
            me.error_callback(P, isRev);
          }
        };
        xhr.send();
      } else if (me.error_callback) {
        me.error_callback(P, isRev);
      }
    } else {
      me.transform_callback(ret, isRev);
    }
  } else {
    return ret;
  }
};

ThinPlateSpline.prototype.__get_point = function(self, P) {
  if (!self.solved) { return 0; } //this.__solve(self); }

  var DPtr = _malloc(16);
  var res  = Module.ccall('_ZN17VizGeorefSpline2D9get_pointEddPd', 'number', ['number','number','number','number'], [self.pointer, P[0], P[1], DPtr]);
  var ret  = [];
  ret[0]   = Module.getValue(DPtr,    'double');
  ret[1]   = Module.getValue(DPtr + 8,'double');

  _free(DPtr);

  return ret;
};

ThinPlateSpline.prototype.serialize = function() {
  var alloc_size = this.serialize_size();
  var all_size   = alloc_size[0] + alloc_size[1] + 2;
  var serial_ptr = _malloc(all_size);
  var work_ptr   = serial_ptr;

  work_ptr = Module.ccall('_ZN17VizGeorefSpline2D9serializeEPc', 'void', ['number', 'number'], [this.__ord.pointer, work_ptr]);
  Module.setValue(work_ptr, this.__ord.solved ? 1 : 0, 'i8');
  work_ptr++;

  work_ptr = Module.ccall('_ZN17VizGeorefSpline2D9serializeEPc', 'void', ['number', 'number'], [this.__rev.pointer, work_ptr]);
  Module.setValue(work_ptr, this.__rev.solved ? 1 : 0, 'i8');
  work_ptr++;

  var ret = new Uint8Array(new Uint8Array(HEAPU8.buffer, serial_ptr, all_size));

  _free(serial_ptr);

  return ret;
};

ThinPlateSpline.prototype.deserialize = function(serial) {
  var me = this;
  if (this.worker) {
    this.worker.postMessage({'method':'deserialize','data':serial});
  } else {
    var all_size   = serial.length;
    var serial_ptr = _malloc(all_size);
    var work_ptr   = serial_ptr;

    HEAPU8.set(serial, serial_ptr);

    work_ptr = Module.ccall('_ZN17VizGeorefSpline2D11deserializeEPc', 'void', ['number', 'number'], [this.__ord.pointer, work_ptr]);
    this.__ord.solved = Module.getValue(work_ptr, 'i8') ? true : false;
    work_ptr++;

    work_ptr = Module.ccall('_ZN17VizGeorefSpline2D11deserializeEPc', 'void', ['number', 'number'], [this.__rev.pointer, work_ptr]);
    this.__rev.solved = Module.getValue(work_ptr, 'i8') ? true : false;
    work_ptr++;

    _free(serial_ptr);
  }
};

ThinPlateSpline.prototype.serialize_size = function() {
  return [this.__serialize_size(this.__ord),this.__serialize_size(this.__rev)];
};

ThinPlateSpline.prototype.__serialize_size = function(self) {
  return Module.ccall('_ZN17VizGeorefSpline2D14serialize_sizeEv', 'number', ['number'], [self.pointer]);
};

// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (vararg) return 8;
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    code = Pointer_stringify(code);
    if (code[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (code.indexOf('"', 1) === code.length-1) {
        code = code.substr(1, code.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + code + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + code + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*(+4294967296))) : ((+((low>>>0)))+((+((high|0)))*(+4294967296)))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    var i = 3;
    // params, etc.
    var basicTypes = {
      'v': 'void',
      'b': 'bool',
      'c': 'char',
      's': 'short',
      'i': 'int',
      'l': 'long',
      'f': 'float',
      'd': 'double',
      'w': 'wchar_t',
      'a': 'signed char',
      'h': 'unsigned char',
      't': 'unsigned short',
      'j': 'unsigned int',
      'm': 'unsigned long',
      'x': 'long long',
      'y': 'unsigned long long',
      'z': '...'
    };
    function dump(x) {
      //return;
      if (x) Module.print(x);
      Module.print(func);
      var pre = '';
      for (var a = 0; a < i; a++) pre += ' ';
      Module.print (pre + '^');
    }
    var subs = [];
    function parseNested() {
      i++;
      if (func[i] === 'K') i++; // ignore const
      var parts = [];
      while (func[i] !== 'E') {
        if (func[i] === 'S') { // substitution
          i++;
          var next = func.indexOf('_', i);
          var num = func.substring(i, next) || 0;
          parts.push(subs[num] || '?');
          i = next+1;
          continue;
        }
        if (func[i] === 'C') { // constructor
          parts.push(parts[parts.length-1]);
          i += 2;
          continue;
        }
        var size = parseInt(func.substr(i));
        var pre = size.toString().length;
        if (!size || !pre) { i--; break; } // counter i++ below us
        var curr = func.substr(i + pre, size);
        parts.push(curr);
        subs.push(curr);
        i += pre + size;
      }
      i++; // skip E
      return parts;
    }
    var first = true;
    function parse(rawList, limit, allowVoid) { // main parser
      limit = limit || Infinity;
      var ret = '', list = [];
      function flushList() {
        return '(' + list.join(', ') + ')';
      }
      var name;
      if (func[i] === 'N') {
        // namespaced N-E
        name = parseNested().join('::');
        limit--;
        if (limit === 0) return rawList ? [name] : name;
      } else {
        // not namespaced
        if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
        var size = parseInt(func.substr(i));
        if (size) {
          var pre = size.toString().length;
          name = func.substr(i + pre, size);
          i += pre + size;
        }
      }
      first = false;
      if (func[i] === 'I') {
        i++;
        var iList = parse(true);
        var iRet = parse(true, 1, true);
        ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
      } else {
        ret = name;
      }
      paramLoop: while (i < func.length && limit-- > 0) {
        //dump('paramLoop');
        var c = func[i++];
        if (c in basicTypes) {
          list.push(basicTypes[c]);
        } else {
          switch (c) {
            case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
            case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
            case 'L': { // literal
              i++; // skip basic type
              var end = func.indexOf('E', i);
              var size = end - i;
              list.push(func.substr(i, size));
              i += size + 2; // size + 'EE'
              break;
            }
            case 'A': { // array
              var size = parseInt(func.substr(i));
              i += size.toString().length;
              if (func[i] !== '_') throw '?';
              i++; // skip _
              list.push(parse(true, 1, true)[0] + ' [' + size + ']');
              break;
            }
            case 'E': break paramLoop;
            default: ret += '?' + c; break paramLoop;
          }
        }
      }
      if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
      return rawList ? list : ret + flushList();
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', or (2) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 10000000;
//var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var TOTAL_MEMORY = 33554432;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===



STATIC_BASE = 8;

STATICTOP = STATIC_BASE + 784;


/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });

var _stderr;
var _stderr=_stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);;












var __ZTVN10__cxxabiv120__si_class_type_infoE;


var __ZTISt9exception;





/* memory initializer */ allocate([109,97,116,114,105,120,73,110,118,101,114,116,40,41,58,32,69,82,82,79,82,32,45,32,109,101,109,111,114,121,32,97,108,108,111,99,97,116,105,111,110,32,102,97,105,108,101,100,46,10,0,0,0,0,0,0,32,65,32,112,111,105,110,116,32,119,97,115,32,100,101,108,101,116,101,100,32,97,102,116,101,114,32,116,104,101,32,108,97,115,116,32,115,111,108,118,101,10,0,0,0,0,0,0,32,78,79,32,105,110,116,101,114,112,111,108,97,116,105,111,110,32,45,32,114,101,116,117,114,110,32,118,97,108,117,101,115,32,97,114,101,32,122,101,114,111,10,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,32,65,32,112,111,105,110,116,32,119,97,115,32,97,100,100,101,100,32,97,102,116,101,114,32,116,104,101,32,108,97,115,116,32,115,111,108,118,101,10,0,0,0,0,0,0,0,0,0,0,0,0,16,1,0,0,4,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);



var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  var _fabs=Math_abs;

  var _sqrt=Math_sqrt;

  var _log=Math_log;

  
   
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;

  function _llvm_umul_with_overflow_i32(x, y) {
      x = x>>>0;
      y = y>>>0;
      return ((asm["setTempRet0"](x*y > 4294967295),(x*y)>>>0)|0);
    }

  
   
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i64=_memset;

  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 0777, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 0777 | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = {};
        for (var key in src.files) {
          if (!src.files.hasOwnProperty(key)) continue;
          var e = src.files[key];
          var e2 = dst.files[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create[key] = e;
            total++;
          }
        }
  
        var remove = {};
        for (var key in dst.files) {
          if (!dst.files.hasOwnProperty(key)) continue;
          var e = dst.files[key];
          var e2 = src.files[key];
          if (!e2) {
            remove[key] = e;
            total++;
          }
        }
  
        if (!total) {
          // early out
          return callback(null);
        }
  
        var completed = 0;
        function done(err) {
          if (err) return callback(err);
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        // create a single transaction to handle and IDB reads / writes we'll need to do
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        transaction.onerror = function transaction_onerror() { callback(this.error); };
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        for (var path in create) {
          if (!create.hasOwnProperty(path)) continue;
          var entry = create[path];
  
          if (dst.type === 'local') {
            // save file to local
            try {
              if (FS.isDir(entry.mode)) {
                FS.mkdir(path, entry.mode);
              } else if (FS.isFile(entry.mode)) {
                var stream = FS.open(path, 'w+', 0666);
                FS.write(stream, entry.contents, 0, entry.contents.length, 0, true /* canOwn */);
                FS.close(stream);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // save file to IDB
            var req = store.put(entry, path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }
  
        for (var path in remove) {
          if (!remove.hasOwnProperty(path)) continue;
          var entry = remove[path];
  
          if (dst.type === 'local') {
            // delete file from local
            try {
              if (FS.isDir(entry.mode)) {
                // TODO recursive delete?
                FS.rmdir(path);
              } else if (FS.isFile(entry.mode)) {
                FS.unlink(path);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // delete file from IDB
            var req = store.delete(path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }
      },getLocalSet:function (mount, callback) {
        var files = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint)
          .filter(isRealDir)
          .map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat, node;
  
          try {
            var lookup = FS.lookupPath(path);
            node = lookup.node;
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path)
              .filter(isRealDir)
              .map(toAbsolute(path)));
  
            files[path] = { mode: stat.mode, timestamp: stat.mtime };
          } else if (FS.isFile(stat.mode)) {
            files[path] = { contents: node.contents, mode: stat.mode, timestamp: stat.mtime };
          } else {
            return callback(new Error('node type not supported'));
          }
        }
  
        return callback(null, { type: 'local', files: files });
      },getDB:function (name, callback) {
        // look it up in the cache
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        req.onupgradeneeded = function req_onupgradeneeded() {
          db = req.result;
          db.createObjectStore(IDBFS.DB_STORE_NAME);
        };
        req.onsuccess = function req_onsuccess() {
          db = req.result;
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function req_onerror() {
          callback(this.error);
        };
      },getRemoteSet:function (mount, callback) {
        var files = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function transaction_onerror() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          store.openCursor().onsuccess = function store_openCursor_onsuccess(event) {
            var cursor = event.target.result;
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, files: files });
            }
  
            files[cursor.key] = cursor.value;
            cursor.continue();
          };
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[null],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || { recurse_count: 0 };
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            current = current.mount.root;
          }
  
          // follow symlinks
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
            this.parent = null;
            this.mount = null;
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            FS.hashAddNode(this);
          };
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          FS.FSNode.prototype = {};
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
        return new FS.FSNode(parent, name, mode, rdev);
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 1;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var completed = 0;
        var total = FS.mounts.length;
        function done(err) {
          if (err) {
            return callback(err);
          }
          if (++completed >= total) {
            callback(null);
          }
        };
  
        // sync all mounts
        for (var i = 0; i < FS.mounts.length; i++) {
          var mount = FS.mounts[i];
          if (!mount.type.syncfs) {
            done(null);
            continue;
          }
          mount.type.syncfs(mount, populate, done);
        }
      },mount:function (type, opts, mountpoint) {
        var lookup;
        if (mountpoint) {
          lookup = FS.lookupPath(mountpoint, { follow: false });
          mountpoint = lookup.path;  // use the absolute path
        }
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          root: null
        };
        // create a root node for the fs
        var root = type.mount(mount);
        root.mount = mount;
        mount.root = root;
        // assign the mount info to the mountpoint's node
        if (lookup) {
          lookup.node.mount = mount;
          lookup.node.mounted = true;
          // compatibility update FS.root if we mount to /
          if (mountpoint === '/') {
            FS.root = mount.root;
          }
        }
        // add to our cached list of mounts
        FS.mounts.push(mount);
        return root;
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 0666;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 0777;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 0666;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path, { follow: false });
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 0666 : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0);
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=stdin.fd;
        assert(stdin.fd === 1, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=stdout.fd;
        assert(stdout.fd === 2, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=stderr.fd;
        assert(stderr.fd === 3, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.root = FS.createNode(null, '/', 16384 | 0777, 0);
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
  
              if (!hasByteServing) chunkSize = datalength;
  
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
  
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
  
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
  
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  
  
  
  
  var _mkport=undefined;var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 0777, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {headers: {'websocket-protocol': ['binary']}} : ['binary'];
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }

  function _abort() {
      Module['abort']();
    }

  var _llvm_memset_p0i8_i32=_memset;

  function ___errno_location() {
      return ___errno_state;
    }

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

  
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  
  
  
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  
  function ___resumeException(ptr) {
      if (!___cxa_last_thrown_exception) { ___cxa_last_thrown_exception = ptr; }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
    }
  
  var ___cxa_last_thrown_exception=0;
  
  var ___cxa_exception_header_size=8;function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = ___cxa_last_thrown_exception;
      header = thrown - ___cxa_exception_header_size;
      if (throwntype == -1) throwntype = HEAP32[((header)>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
  
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return ((asm["setTempRet0"](throwntype),thrown)|0);
    }function ___gxx_personality_v0() {
    }

  function ___cxa_allocate_exception(size) {
      var ptr = _malloc(size + ___cxa_exception_header_size);
      return ptr + ___cxa_exception_header_size;
    }

  function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      var header = ptr - ___cxa_exception_header_size;
      HEAP32[((header)>>2)]=type;
      HEAP32[(((header)+(4))>>2)]=destructor;
      ___cxa_last_thrown_exception = ptr;
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
    }

  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }

  function __ZNSt9exceptionD2Ev() {}





   
  Module["_strlen"] = _strlen;

  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
  
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            var errorInfo = '?';
            function onContextCreationError(event) {
              errorInfo = event.statusMessage || errorInfo;
            }
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
  
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (scrollX + rect.left);
              y = t.pageY - (scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (scrollX + rect.left);
            y = event.pageY - (scrollY + rect.top);
          }
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 10000000;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");


var Math_min = Math.min;
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.__ZTISt9exception|0;var n=env._stderr|0;var o=env.__ZTVN10__cxxabiv120__si_class_type_infoE|0;var p=+env.NaN;var q=+env.Infinity;var r=0;var s=0;var t=0;var u=0;var v=0,w=0,x=0,y=0,z=0.0,A=0,B=0,C=0,D=0.0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=0;var O=global.Math.floor;var P=global.Math.abs;var Q=global.Math.sqrt;var R=global.Math.pow;var S=global.Math.cos;var T=global.Math.sin;var U=global.Math.tan;var V=global.Math.acos;var W=global.Math.asin;var X=global.Math.atan;var Y=global.Math.atan2;var Z=global.Math.exp;var _=global.Math.log;var $=global.Math.ceil;var aa=global.Math.imul;var ba=env.abort;var ca=env.assert;var da=env.asmPrintInt;var ea=env.asmPrintFloat;var fa=env.min;var ga=env.invoke_ii;var ha=env.invoke_v;var ia=env.invoke_iii;var ja=env.invoke_vi;var ka=env._sysconf;var la=env.___cxa_throw;var ma=env._abort;var na=env._send;var oa=env._fflush;var pa=env._log;var qa=env._fabs;var ra=env.___setErrNo;var sa=env._fwrite;var ta=env._sqrt;var ua=env._write;var va=env._llvm_umul_with_overflow_i32;var wa=env.___cxa_find_matching_catch;var xa=env.___cxa_allocate_exception;var ya=env.___resumeException;var za=env.___cxa_is_number_type;var Aa=env.___cxa_does_inherit;var Ba=env.__ZSt18uncaught_exceptionv;var Ca=env._pwrite;var Da=env.___cxa_call_unexpected;var Ea=env._sbrk;var Fa=env.___errno_location;var Ga=env.___gxx_personality_v0;var Ha=env.__ZNSt9exceptionD2Ev;var Ia=env._time;var Ja=0.0;
// EMSCRIPTEN_START_FUNCS
function Oa(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7&-8;return b|0}function Pa(){return i|0}function Qa(a){a=a|0;i=a}function Ra(a,b){a=a|0;b=b|0;if((r|0)==0){r=a;s=b}}function Sa(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function Ta(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function Ua(a){a=a|0;E=a}function Va(a){a=a|0;F=a}function Wa(a){a=a|0;G=a}function Xa(a){a=a|0;H=a}function Ya(a){a=a|0;I=a}function Za(a){a=a|0;J=a}function _a(a){a=a|0;K=a}function $a(a){a=a|0;L=a}function ab(a){a=a|0;M=a}function bb(a){a=a|0;N=a}function cb(){c[68]=o+8;c[70]=m}function db(a,b){a=a|0;b=b|0;var d=0;c[a+88>>2]=0;c[a+68>>2]=0;c[a+64>>2]=0;c[a+96>>2]=0;c[a+92>>2]=0;if((b|0)>0){d=0;do{c[a+72+(d<<2)>>2]=0;c[a+80+(d<<2)>>2]=0;d=d+1|0;}while((d|0)<(b|0))}Cb(a+24|0,0,16)|0;h[a+40>>3]=10.0;c[a+8>>2]=0;c[a+4>>2]=b;c[a+12>>2]=0;c[a+100>>2]=0;c[a+104>>2]=0;eb(a);c[a>>2]=0;return}function eb(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0;b=a+12|0;d=c[b>>2]|0;e=d<<1;f=e+2|0;g=e+5|0;if((d|0)==0){d=g<<3;c[a+64>>2]=ob(d)|0;c[a+68>>2]=ob(d)|0;c[a+88>>2]=ob(d)|0;d=g<<2;c[a+92>>2]=ob(d)|0;c[a+96>>2]=ob(d)|0;c[a+72>>2]=qb(8,g)|0;c[a+80>>2]=qb(8,g)|0;c[a+76>>2]=qb(8,g)|0;c[a+84>>2]=qb(8,g)|0;c[b>>2]=f;return}else{d=a+64|0;e=g<<3;c[d>>2]=rb(c[d>>2]|0,e)|0;d=a+68|0;c[d>>2]=rb(c[d>>2]|0,e)|0;d=a+88|0;c[d>>2]=rb(c[d>>2]|0,e)|0;d=a+92|0;h=g<<2;c[d>>2]=rb(c[d>>2]|0,h)|0;d=a+96|0;c[d>>2]=rb(c[d>>2]|0,h)|0;h=a+72|0;c[h>>2]=rb(c[h>>2]|0,e)|0;h=a+80|0;c[h>>2]=rb(c[h>>2]|0,e)|0;h=a+76|0;c[h>>2]=rb(c[h>>2]|0,e)|0;h=a+84|0;c[h>>2]=rb(c[h>>2]|0,e)|0;c[b>>2]=f;return}}function fb(a){a=a|0;var b=0,d=0;b=c[a+100>>2]|0;if((b|0)!=0){pb(b)}b=c[a+104>>2]|0;if((b|0)!=0){pb(b)}pb(c[a+64>>2]|0);pb(c[a+68>>2]|0);pb(c[a+88>>2]|0);pb(c[a+92>>2]|0);pb(c[a+96>>2]|0);b=a+4|0;if((c[b>>2]|0)>0){d=0}else{return}do{pb(c[a+72+(d<<2)>>2]|0);pb(c[a+80+(d<<2)>>2]|0);d=d+1|0;}while((d|0)<(c[b>>2]|0));return}function gb(){return 112}function hb(a,b,d,e){a=a|0;b=+b;d=+d;e=e|0;var f=0,g=0,i=0,j=0,k=0,l=0;c[a>>2]=5;f=a+8|0;g=c[f>>2]|0;if((g|0)==(c[a+12>>2]|0)){eb(a);i=c[f>>2]|0}else{i=g}h[(c[a+64>>2]|0)+(i<<3)>>3]=b;h[(c[a+68>>2]|0)+(i<<3)>>3]=d;g=a+4|0;if((c[g>>2]|0)<=0){j=c[f>>2]|0;k=j+1|0;c[f>>2]=k;return 1}l=i+3|0;i=0;do{h[(c[a+72+(i<<2)>>2]|0)+(l<<3)>>3]=+h[e+(i<<3)>>3];i=i+1|0;}while((i|0)<(c[g>>2]|0));j=c[f>>2]|0;k=j+1|0;c[f>>2]=k;return 1}function ib(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,i=0.0,j=0,k=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,R=0,S=0,T=0.0,U=0,V=0,W=0,X=0,Y=0,Z=0,$=0,ba=0,ca=0,da=0,ea=0,fa=0.0,ga=0,ha=0;b=a+8|0;d=c[b>>2]|0;if((d|0)<1){c[a>>2]=0;e=0;return e|0}if((d|0)==1){c[a>>2]=1;e=1;return e|0}f=a+64|0;g=c[f>>2]|0;if((d|0)==2){i=+h[g+8>>3]- +h[g>>3];j=a+48|0;h[j>>3]=i;k=c[a+68>>2]|0;l=+h[k+8>>3]- +h[k>>3];m=1.0/(i*i+l*l);h[j>>3]=i*m;h[a+56>>3]=m*l;c[a>>2]=2;e=2;return e|0}l=+h[g>>3];j=a+68|0;k=c[j>>2]|0;m=+h[k>>3];i=m;n=m;o=0.0;p=0.0;q=0.0;r=0.0;s=0.0;t=l;u=l;v=1;w=l;l=m;while(1){x=u>w?u:w;y=t<w?t:w;z=n>l?n:l;A=i<l?i:l;B=o+w;C=q+w*w;D=p+l;E=r+l*l;F=s+w*l;if((v|0)>=(d|0)){break}m=+h[g+(v<<3)>>3];G=+h[k+(v<<3)>>3];i=A;n=z;o=B;p=D;q=C;r=E;s=F;t=y;u=x;v=v+1|0;w=m;l=G}l=x-y;y=z-A;A=B*B;z=+(d|0);x=D*D;w=F-B*D/z;do{if(!(l<y*.001|y<l*.001)){if(+P(+(w*w/((E-x/z)*(C-A/z))))>.99){break}c[a>>2]=4;d=a+100|0;v=c[d>>2]|0;if((v|0)!=0){pb(v)}v=a+104|0;H=c[v>>2]|0;if((H|0)!=0){pb(H)}H=c[b>>2]|0;I=H+3|0;J=a+16|0;c[J>>2]=I;K=aa(I,I)|0;L=qb(K,8)|0;M=L;c[d>>2]=M;c[v>>2]=qb(K,8)|0;Cb(L|0,0,24)|0;h[M+(I<<3)>>3]=0.0;h[M+(H+4<<3)>>3]=0.0;h[M+(H+5<<3)>>3]=0.0;L=I<<1;h[M+(L<<3)>>3]=0.0;h[M+((L|1)<<3)>>3]=0.0;h[M+(L+2<<3)>>3]=0.0;do{if((H|0)>0){L=0;I=M;while(1){K=L+3|0;h[I+(K<<3)>>3]=1.0;h[(c[d>>2]|0)+((c[J>>2]|0)+K<<3)>>3]=+h[(c[f>>2]|0)+(L<<3)>>3];h[(c[d>>2]|0)+((c[J>>2]<<1)+K<<3)>>3]=+h[(c[j>>2]|0)+(L<<3)>>3];N=aa(c[J>>2]|0,K)|0;h[(c[d>>2]|0)+(N<<3)>>3]=1.0;N=(aa(c[J>>2]|0,K)|0)+1|0;h[(c[d>>2]|0)+(N<<3)>>3]=+h[(c[f>>2]|0)+(L<<3)>>3];N=(aa(c[J>>2]|0,K)|0)+2|0;h[(c[d>>2]|0)+(N<<3)>>3]=+h[(c[j>>2]|0)+(L<<3)>>3];N=L+1|0;O=c[b>>2]|0;if((N|0)>=(O|0)){break}L=N;I=c[d>>2]|0}if((O|0)>0){R=0;S=O}else{break}while(1){if((R|0)<(S|0)){I=R+3|0;L=R;while(1){N=c[f>>2]|0;D=+h[N+(R<<3)>>3];K=c[j>>2]|0;B=+h[K+(R<<3)>>3];F=+h[N+(L<<3)>>3];u=+h[K+(L<<3)>>3];if(D==F&B==u){T=0.0}else{t=F-D;D=u-B;B=t*t+D*D;T=B*+_(B)}K=L+3|0;N=(aa(c[J>>2]|0,I)|0)+K|0;h[(c[d>>2]|0)+(N<<3)>>3]=T;if((R|0)!=(L|0)){N=c[J>>2]|0;U=(aa(N,I)|0)+K|0;V=c[d>>2]|0;h[V+((aa(N,K)|0)+I<<3)>>3]=+h[V+(U<<3)>>3]}U=L+1|0;V=c[b>>2]|0;if((U|0)<(V|0)){L=U}else{W=V;break}}}else{W=S}L=R+1|0;if((L|0)<(W|0)){R=L;S=W}else{break}}}}while(0);if((jb(c[J>>2]|0,c[d>>2]|0,c[v>>2]|0)|0)==0){e=0;return e|0}M=a+4|0;H=c[M>>2]|0;if((H|0)<=0){e=4;return e|0}L=0;I=c[J>>2]|0;V=H;while(1){if((I|0)>0){H=a+80+(L<<2)|0;U=a+72+(L<<2)|0;K=0;do{h[(c[H>>2]|0)+(K<<3)>>3]=0.0;N=c[J>>2]|0;if((N|0)>0){X=0;Y=N;while(1){Z=(aa(Y,K)|0)+X|0;$=(c[H>>2]|0)+(K<<3)|0;h[$>>3]=+h[(c[v>>2]|0)+(Z<<3)>>3]*+h[(c[U>>2]|0)+(X<<3)>>3]+ +h[$>>3];$=X+1|0;Z=c[J>>2]|0;if(($|0)<(Z|0)){X=$;Y=Z}else{ba=Z;break}}}else{ba=N}K=K+1|0;}while((K|0)<(ba|0));ca=ba;da=c[M>>2]|0}else{ca=I;da=V}K=L+1|0;if((K|0)<(da|0)){L=K;I=ca;V=da}else{e=4;break}}return e|0}}while(0);c[a>>2]=3;T=C*z-A;da=a+48|0;A=E*z-x;ca=a+56|0;x=1.0/+Q(T*T+A*A);z=T*x;h[da>>3]=z;T=x*A;h[ca>>3]=T;ba=a+88|0;W=a+92|0;S=0;R=g;g=k;A=z;z=T;while(1){h[(c[ba>>2]|0)+(S<<3)>>3]=(+h[R+(S<<3)>>3]- +h[R>>3])*A+(+h[g+(S<<3)>>3]- +h[g>>3])*z;c[(c[W>>2]|0)+(S<<2)>>2]=1;k=S+1|0;ea=c[b>>2]|0;if((k|0)>=(ea|0)){break}S=k;R=c[f>>2]|0;g=c[j>>2]|0;A=+h[da>>3];z=+h[ca>>3]}if((ea|0)<=0){e=3;return e|0}ca=a+96|0;da=a+92|0;j=a+88|0;a=0;g=ea;while(1){if((g|0)>0){ea=c[da>>2]|0;f=0;R=-1;z=0.0;while(1){if((c[ea+(f<<2)>>2]|0)==0){fa=z;ga=R}else{A=+h[(c[j>>2]|0)+(f<<3)>>3];S=(R|0)<0|A<z;fa=S?A:z;ga=S?f:R}S=f+1|0;if((S|0)<(g|0)){f=S;R=ga;z=fa}else{ha=ga;break}}}else{ha=-1}c[(c[ca>>2]|0)+(a<<2)>>2]=ha;c[(c[da>>2]|0)+(ha<<2)>>2]=0;R=a+1|0;f=c[b>>2]|0;if((R|0)<(f|0)){a=R;g=f}else{e=3;break}}return e|0}function jb(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,o=0,p=0,q=0,r=0.0,s=0,t=0,u=0,v=0,w=0,x=0,y=0.0;e=a<<1;f=va(aa(e,a)|0,8)|0;g=vb(E?-1:f)|0;f=g;if((g|0)==0){sa(8,50,1,c[n>>2]|0)|0;i=0;return i|0}j=(a|0)>0;do{if(j){k=0;do{l=aa(k,a)|0;m=aa(e,k)|0;o=0;do{p=o+m|0;h[f+(p<<3)>>3]=+h[b+(o+l<<3)>>3];h[f+(p+a<<3)>>3]=0.0;o=o+1|0;}while((o|0)<(a|0));h[f+(k+a+m<<3)>>3]=1.0;k=k+1|0;}while((k|0)<(a|0));if(j){q=0}else{break}while(1){k=q+1|0;o=(k|0)<(a|0);do{if(o){l=k;p=q;do{r=+P(+(+h[f+((aa(e,l)|0)+q<<3)>>3]));s=r>+P(+(+h[f+((aa(e,p)|0)+q<<3)>>3]));p=s?l:p;l=l+1|0;}while((l|0)<(a|0));if(!((p|0)!=(q|0)&(q|0)<(e|0))){break}l=aa(e,q)|0;s=aa(e,p)|0;t=q;do{u=f+(t+l<<3)|0;r=+h[u>>3];v=f+(t+s<<3)|0;h[u>>3]=+h[v>>3];h[v>>3]=r;t=t+1|0;}while((t|0)<(e|0))}}while(0);m=aa(q<<1,a)|0;r=+h[f+(m+q<<3)>>3];if(r==0.0){w=19;break}t=(q|0)<(e|0);do{if(t){s=q;do{l=f+(s+m<<3)|0;h[l>>3]=+h[l>>3]/r;s=s+1|0;}while((s|0)<(e|0));if(t){x=0}else{break}do{if((x|0)!=(q|0)){s=aa(x<<1,a)|0;y=+h[f+(s+q<<3)>>3];l=q;do{p=f+(l+s<<3)|0;h[p>>3]=+h[p>>3]-y*+h[f+(l+m<<3)>>3];l=l+1|0;}while((l|0)<(e|0))}x=x+1|0;}while((x|0)<(a|0))}}while(0);if(o){q=k}else{break}}if((w|0)==19){xb(g);i=0;return i|0}if(!j){break}m=a<<3;t=a<<4;l=0;do{Bb(d+((aa(l,a)|0)<<3)|0,g+(m+(aa(t,l)|0))|0,m)|0;l=l+1|0;}while((l|0)<(a|0))}}while(0);xb(g);i=1;return i|0}function kb(a,b,d,e){a=a|0;b=+b;d=+d;e=e|0;var f=0,g=0,i=0,j=0,k=0,l=0,m=0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;switch(c[a>>2]|0){case 4:{f=a+4|0;g=c[f>>2]|0;if((g|0)>0){i=0;while(1){j=c[a+80+(i<<2)>>2]|0;h[e+(i<<3)>>3]=+h[j>>3]+ +h[j+8>>3]*b+ +h[j+16>>3]*d;j=i+1|0;k=c[f>>2]|0;if((j|0)<(k|0)){i=j}else{l=k;break}}}else{l=g}g=a+8|0;i=c[g>>2]|0;if((i|0)<=0){m=1;return m|0}k=a+64|0;j=a+68|0;o=0;p=l;l=i;while(1){q=+h[(c[k>>2]|0)+(o<<3)>>3];r=+h[(c[j>>2]|0)+(o<<3)>>3];if(q==b&r==d){s=0.0}else{t=q-b;q=r-d;r=t*t+q*q;s=r*+_(r)}if((p|0)>0){i=o+3|0;u=0;do{v=e+(u<<3)|0;h[v>>3]=+h[v>>3]+s*+h[(c[a+80+(u<<2)>>2]|0)+(i<<3)>>3];u=u+1|0;w=c[f>>2]|0;}while((u|0)<(w|0));x=w;y=c[g>>2]|0}else{x=p;y=l}u=o+1|0;if((u|0)<(y|0)){o=u;p=x;l=y}else{m=1;break}}return m|0};case 1:{y=a+4|0;if((c[y>>2]|0)>0){z=0}else{m=1;return m|0}while(1){h[e+(z<<3)>>3]=+h[(c[a+72+(z<<2)>>2]|0)+24>>3];l=z+1|0;if((l|0)<(c[y>>2]|0)){z=l}else{m=1;break}}return m|0};case 0:{z=a+4|0;if((c[z>>2]|0)>0){A=0}else{m=1;return m|0}while(1){h[e+(A<<3)>>3]=0.0;y=A+1|0;if((y|0)<(c[z>>2]|0)){A=y}else{m=1;break}}return m|0};case 2:{s=+h[a+48>>3]*(b- +h[c[a+64>>2]>>3])+ +h[a+56>>3]*(d- +h[c[a+68>>2]>>3]);A=a+4|0;if((c[A>>2]|0)<=0){m=1;return m|0}r=1.0-s;z=0;while(1){y=c[a+72+(z<<2)>>2]|0;h[e+(z<<3)>>3]=r*+h[y+24>>3]+s*+h[y+32>>3];y=z+1|0;if((y|0)<(c[A>>2]|0)){z=y}else{m=1;break}}return m|0};case 3:{s=+h[a+48>>3]*(b- +h[c[a+64>>2]>>3])+ +h[a+56>>3]*(d- +h[c[a+68>>2]>>3]);z=c[a+96>>2]|0;A=c[z>>2]|0;y=c[a+88>>2]|0;a:do{if(s>+h[y+(A<<3)>>3]){l=c[a+8>>2]|0;x=c[z+(l-1<<2)>>2]|0;if(s<+h[y+(x<<3)>>3]){B=1;C=0;D=0;E=A}else{F=x;G=c[z+(l-2<<2)>>2]|0;break}while(1){if((B|0)>=(l|0)){F=D;G=C;break a}x=c[z+(B<<2)>>2]|0;if(s>=+h[y+(E<<3)>>3]){if(s<=+h[y+(x<<3)>>3]){F=x;G=E;break a}}B=B+1|0;C=E;D=x;E=x}}else{F=c[z+4>>2]|0;G=A}}while(0);d=+h[y+(G<<3)>>3];b=(s-d)/(+h[y+(F<<3)>>3]-d);y=a+4|0;if((c[y>>2]|0)<=0){m=1;return m|0}d=1.0-b;A=G+3|0;G=F+3|0;F=0;while(1){z=c[a+72+(F<<2)>>2]|0;h[e+(F<<3)>>3]=d*+h[z+(A<<3)>>3]+b*+h[z+(G<<3)>>3];z=F+1|0;if((z|0)<(c[y>>2]|0)){F=z}else{m=1;break}}return m|0};case 5:{F=c[n>>2]|0;sa(176,40,1,F|0)|0;sa(112,43,1,F|0)|0;F=a+4|0;if((c[F>>2]|0)>0){H=0}else{m=0;return m|0}while(1){h[e+(H<<3)>>3]=0.0;y=H+1|0;if((y|0)<(c[F>>2]|0)){H=y}else{m=0;break}}return m|0};case 6:{H=c[n>>2]|0;sa(64,42,1,H|0)|0;sa(112,43,1,H|0)|0;H=a+4|0;if((c[H>>2]|0)>0){I=0}else{m=0;return m|0}while(1){h[e+(I<<3)>>3]=0.0;a=I+1|0;if((a|0)<(c[H>>2]|0)){I=a}else{m=0;break}}return m|0};default:{m=0;return m|0}}return 0}function lb(a){a=a|0;var b=0,d=0,e=0;b=(c[a+12>>2]<<6)+256|0;d=c[a+16>>2]|0;if((c[a+100>>2]|0)==0){e=b;return e|0}e=(aa(d<<4,d)|0)+b|0;return e|0}function mb(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,x=0,y=0,z=0;f=b+12|0;g=c[f>>2]|0;h=g+3|0;i=b+16|0;j=c[i>>2]|0;k=aa(j,j)|0;j=b+100|0;l=(c[j>>2]|0)!=0;m=b+4|0;n=e;w=d[m]|d[m+1|0]<<8|d[m+2|0]<<16|d[m+3|0]<<24|0;a[n]=w;w=w>>8;a[n+1|0]=w;w=w>>8;a[n+2|0]=w;w=w>>8;a[n+3|0]=w;n=b+8|0;m=e+4|0;w=d[n]|d[n+1|0]<<8|d[n+2|0]<<16|d[n+3|0]<<24|0;a[m]=w;w=w>>8;a[m+1|0]=w;w=w>>8;a[m+2|0]=w;w=w>>8;a[m+3|0]=w;m=e+8|0;w=d[f]|d[f+1|0]<<8|d[f+2|0]<<16|d[f+3|0]<<24|0;a[m]=w;w=w>>8;a[m+1|0]=w;w=w>>8;a[m+2|0]=w;w=w>>8;a[m+3|0]=w;m=e+12|0;w=d[i]|d[i+1|0]<<8|d[i+2|0]<<16|d[i+3|0]<<24|0;a[m]=w;w=w>>8;a[m+1|0]=w;w=w>>8;a[m+2|0]=w;w=w>>8;a[m+3|0]=w;m=e+16|0;w=l&1;a[m]=w;w=w>>8;a[m+1|0]=w;w=w>>8;a[m+2|0]=w;w=w>>8;a[m+3|0]=w;m=b|0;i=e+20|0;w=d[m]|d[m+1|0]<<8|d[m+2|0]<<16|d[m+3|0]<<24|0;a[i]=w;w=w>>8;a[i+1|0]=w;w=w>>8;a[i+2|0]=w;w=w>>8;a[i+3|0]=w;i=b+24|0;m=e+24|0;f=i|0;n=i+4|0;i=d[n]|d[n+1|0]<<8|d[n+2|0]<<16|d[n+3|0]<<24|0;n=m|0;w=d[f]|d[f+1|0]<<8|d[f+2|0]<<16|d[f+3|0]<<24|0;a[n]=w;w=w>>8;a[n+1|0]=w;w=w>>8;a[n+2|0]=w;w=w>>8;a[n+3|0]=w;n=m+4|0;w=i;a[n]=w;w=w>>8;a[n+1|0]=w;w=w>>8;a[n+2|0]=w;w=w>>8;a[n+3|0]=w;n=b+32|0;i=e+32|0;m=n|0;f=n+4|0;n=d[f]|d[f+1|0]<<8|d[f+2|0]<<16|d[f+3|0]<<24|0;f=i|0;w=d[m]|d[m+1|0]<<8|d[m+2|0]<<16|d[m+3|0]<<24|0;a[f]=w;w=w>>8;a[f+1|0]=w;w=w>>8;a[f+2|0]=w;w=w>>8;a[f+3|0]=w;f=i+4|0;w=n;a[f]=w;w=w>>8;a[f+1|0]=w;w=w>>8;a[f+2|0]=w;w=w>>8;a[f+3|0]=w;f=b+40|0;n=e+40|0;i=f|0;m=f+4|0;f=d[m]|d[m+1|0]<<8|d[m+2|0]<<16|d[m+3|0]<<24|0;m=n|0;w=d[i]|d[i+1|0]<<8|d[i+2|0]<<16|d[i+3|0]<<24|0;a[m]=w;w=w>>8;a[m+1|0]=w;w=w>>8;a[m+2|0]=w;w=w>>8;a[m+3|0]=w;m=n+4|0;w=f;a[m]=w;w=w>>8;a[m+1|0]=w;w=w>>8;a[m+2|0]=w;w=w>>8;a[m+3|0]=w;m=b+48|0;f=e+48|0;n=m|0;i=m+4|0;m=d[i]|d[i+1|0]<<8|d[i+2|0]<<16|d[i+3|0]<<24|0;i=f|0;w=d[n]|d[n+1|0]<<8|d[n+2|0]<<16|d[n+3|0]<<24|0;a[i]=w;w=w>>8;a[i+1|0]=w;w=w>>8;a[i+2|0]=w;w=w>>8;a[i+3|0]=w;i=f+4|0;w=m;a[i]=w;w=w>>8;a[i+1|0]=w;w=w>>8;a[i+2|0]=w;w=w>>8;a[i+3|0]=w;i=b+56|0;m=e+56|0;f=i|0;n=i+4|0;i=d[n]|d[n+1|0]<<8|d[n+2|0]<<16|d[n+3|0]<<24|0;n=m|0;w=d[f]|d[f+1|0]<<8|d[f+2|0]<<16|d[f+3|0]<<24|0;a[n]=w;w=w>>8;a[n+1|0]=w;w=w>>8;a[n+2|0]=w;w=w>>8;a[n+3|0]=w;n=m+4|0;w=i;a[n]=w;w=w>>8;a[n+1|0]=w;w=w>>8;a[n+2|0]=w;w=w>>8;a[n+3|0]=w;n=e+64|0;if((h|0)>0){i=b+92|0;m=b+96|0;f=b+64|0;o=b+68|0;p=b+88|0;q=b+72|0;r=(g<<6)+256|0;g=n;s=0;while(1){t=(c[i>>2]|0)+(s<<2)|0;u=g;w=d[t]|d[t+1|0]<<8|d[t+2|0]<<16|d[t+3|0]<<24|0;a[u]=w;w=w>>8;a[u+1|0]=w;w=w>>8;a[u+2|0]=w;w=w>>8;a[u+3|0]=w;u=(c[m>>2]|0)+(s<<2)|0;t=g+4|0;w=d[u]|d[u+1|0]<<8|d[u+2|0]<<16|d[u+3|0]<<24|0;a[t]=w;w=w>>8;a[t+1|0]=w;w=w>>8;a[t+2|0]=w;w=w>>8;a[t+3|0]=w;t=(c[f>>2]|0)+(s<<3)|0;u=g+8|0;v=t|0;x=t+4|0;t=d[x]|d[x+1|0]<<8|d[x+2|0]<<16|d[x+3|0]<<24|0;x=u|0;w=d[v]|d[v+1|0]<<8|d[v+2|0]<<16|d[v+3|0]<<24|0;a[x]=w;w=w>>8;a[x+1|0]=w;w=w>>8;a[x+2|0]=w;w=w>>8;a[x+3|0]=w;x=u+4|0;w=t;a[x]=w;w=w>>8;a[x+1|0]=w;w=w>>8;a[x+2|0]=w;w=w>>8;a[x+3|0]=w;x=(c[o>>2]|0)+(s<<3)|0;t=g+16|0;u=x|0;v=x+4|0;x=d[v]|d[v+1|0]<<8|d[v+2|0]<<16|d[v+3|0]<<24|0;v=t|0;w=d[u]|d[u+1|0]<<8|d[u+2|0]<<16|d[u+3|0]<<24|0;a[v]=w;w=w>>8;a[v+1|0]=w;w=w>>8;a[v+2|0]=w;w=w>>8;a[v+3|0]=w;v=t+4|0;w=x;a[v]=w;w=w>>8;a[v+1|0]=w;w=w>>8;a[v+2|0]=w;w=w>>8;a[v+3|0]=w;v=(c[p>>2]|0)+(s<<3)|0;x=g+24|0;t=v|0;u=v+4|0;v=d[u]|d[u+1|0]<<8|d[u+2|0]<<16|d[u+3|0]<<24|0;u=x|0;w=d[t]|d[t+1|0]<<8|d[t+2|0]<<16|d[t+3|0]<<24|0;a[u]=w;w=w>>8;a[u+1|0]=w;w=w>>8;a[u+2|0]=w;w=w>>8;a[u+3|0]=w;u=x+4|0;w=v;a[u]=w;w=w>>8;a[u+1|0]=w;w=w>>8;a[u+2|0]=w;w=w>>8;a[u+3|0]=w;u=(c[q>>2]|0)+(s<<3)|0;v=g+32|0;x=u|0;t=u+4|0;u=d[t]|d[t+1|0]<<8|d[t+2|0]<<16|d[t+3|0]<<24|0;t=v|0;w=d[x]|d[x+1|0]<<8|d[x+2|0]<<16|d[x+3|0]<<24|0;a[t]=w;w=w>>8;a[t+1|0]=w;w=w>>8;a[t+2|0]=w;w=w>>8;a[t+3|0]=w;t=v+4|0;w=u;a[t]=w;w=w>>8;a[t+1|0]=w;w=w>>8;a[t+2|0]=w;w=w>>8;a[t+3|0]=w;t=(c[b+80>>2]|0)+(s<<3)|0;u=g+40|0;v=t|0;x=t+4|0;t=d[x]|d[x+1|0]<<8|d[x+2|0]<<16|d[x+3|0]<<24|0;x=u|0;w=d[v]|d[v+1|0]<<8|d[v+2|0]<<16|d[v+3|0]<<24|0;a[x]=w;w=w>>8;a[x+1|0]=w;w=w>>8;a[x+2|0]=w;w=w>>8;a[x+3|0]=w;x=u+4|0;w=t;a[x]=w;w=w>>8;a[x+1|0]=w;w=w>>8;a[x+2|0]=w;w=w>>8;a[x+3|0]=w;x=(c[b+76>>2]|0)+(s<<3)|0;t=g+48|0;u=x|0;v=x+4|0;x=d[v]|d[v+1|0]<<8|d[v+2|0]<<16|d[v+3|0]<<24|0;v=t|0;w=d[u]|d[u+1|0]<<8|d[u+2|0]<<16|d[u+3|0]<<24|0;a[v]=w;w=w>>8;a[v+1|0]=w;w=w>>8;a[v+2|0]=w;w=w>>8;a[v+3|0]=w;v=t+4|0;w=x;a[v]=w;w=w>>8;a[v+1|0]=w;w=w>>8;a[v+2|0]=w;w=w>>8;a[v+3|0]=w;v=(c[b+84>>2]|0)+(s<<3)|0;x=g+56|0;t=v|0;u=v+4|0;v=d[u]|d[u+1|0]<<8|d[u+2|0]<<16|d[u+3|0]<<24|0;u=x|0;w=d[t]|d[t+1|0]<<8|d[t+2|0]<<16|d[t+3|0]<<24|0;a[u]=w;w=w>>8;a[u+1|0]=w;w=w>>8;a[u+2|0]=w;w=w>>8;a[u+3|0]=w;u=x+4|0;w=v;a[u]=w;w=w>>8;a[u+1|0]=w;w=w>>8;a[u+2|0]=w;w=w>>8;a[u+3|0]=w;u=s+1|0;if((u|0)<(h|0)){g=g+64|0;s=u}else{break}}y=e+r|0}else{y=n}if((k|0)==0|l^1){z=y;return z|0}l=b+104|0;b=(k|0)>1?k<<4:16;n=y;r=0;while(1){e=(c[j>>2]|0)+(r<<3)|0;s=n;g=e|0;h=e+4|0;e=d[h]|d[h+1|0]<<8|d[h+2|0]<<16|d[h+3|0]<<24|0;h=s|0;w=d[g]|d[g+1|0]<<8|d[g+2|0]<<16|d[g+3|0]<<24|0;a[h]=w;w=w>>8;a[h+1|0]=w;w=w>>8;a[h+2|0]=w;w=w>>8;a[h+3|0]=w;h=s+4|0;w=e;a[h]=w;w=w>>8;a[h+1|0]=w;w=w>>8;a[h+2|0]=w;w=w>>8;a[h+3|0]=w;h=(c[l>>2]|0)+(r<<3)|0;e=n+8|0;s=h|0;g=h+4|0;h=d[g]|d[g+1|0]<<8|d[g+2|0]<<16|d[g+3|0]<<24|0;g=e|0;w=d[s]|d[s+1|0]<<8|d[s+2|0]<<16|d[s+3|0]<<24|0;a[g]=w;w=w>>8;a[g+1|0]=w;w=w>>8;a[g+2|0]=w;w=w>>8;a[g+3|0]=w;g=e+4|0;w=h;a[g]=w;w=w>>8;a[g+1|0]=w;w=w>>8;a[g+2|0]=w;w=w>>8;a[g+3|0]=w;g=r+1|0;if((g|0)<(k|0)){n=n+16|0;r=g}else{break}}z=y+b|0;return z|0}function nb(b,e){b=b|0;e=e|0;var f=0,g=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,x=0,y=0.0,z=0,A=0,B=0,C=0,D=0,E=0;f=b+100|0;g=c[f>>2]|0;if((g|0)!=0){pb(g);c[f>>2]=0}g=b+104|0;i=c[g>>2]|0;if((i|0)!=0){pb(i);c[g>>2]=0}i=b+64|0;pb(c[i>>2]|0);j=b+68|0;pb(c[j>>2]|0);l=b+88|0;pb(c[l>>2]|0);m=b+92|0;pb(c[m>>2]|0);n=b+96|0;pb(c[n>>2]|0);o=b+72|0;pb(c[o>>2]|0);p=b+80|0;pb(c[p>>2]|0);q=b+76|0;pb(c[q>>2]|0);r=b+84|0;pb(c[r>>2]|0);s=b+4|0;t=e;w=d[t]|d[t+1|0]<<8|d[t+2|0]<<16|d[t+3|0]<<24|0;a[s]=w;w=w>>8;a[s+1|0]=w;w=w>>8;a[s+2|0]=w;w=w>>8;a[s+3|0]=w;s=b+8|0;t=e+4|0;w=d[t]|d[t+1|0]<<8|d[t+2|0]<<16|d[t+3|0]<<24|0;a[s]=w;w=w>>8;a[s+1|0]=w;w=w>>8;a[s+2|0]=w;w=w>>8;a[s+3|0]=w;s=b+12|0;t=e+8|0;u=d[t]|d[t+1|0]<<8|d[t+2|0]<<16|d[t+3|0]<<24|0;w=u;a[s]=w;w=w>>8;a[s+1|0]=w;w=w>>8;a[s+2|0]=w;w=w>>8;a[s+3|0]=w;s=b+16|0;t=e+12|0;v=d[t]|d[t+1|0]<<8|d[t+2|0]<<16|d[t+3|0]<<24|0;w=v;a[s]=w;w=w>>8;a[s+1|0]=w;w=w>>8;a[s+2|0]=w;w=w>>8;a[s+3|0]=w;s=e+16|0;t=d[s]|d[s+1|0]<<8|d[s+2|0]<<16|d[s+3|0]<<24|0;s=e+20|0;x=b|0;w=d[s]|d[s+1|0]<<8|d[s+2|0]<<16|d[s+3|0]<<24|0;a[x]=w;w=w>>8;a[x+1|0]=w;w=w>>8;a[x+2|0]=w;w=w>>8;a[x+3|0]=w;x=b+24|0;s=e+24|0;y=(c[k>>2]=d[s]|d[s+1|0]<<8|d[s+2|0]<<16|d[s+3|0]<<24,c[k+4>>2]=d[s+4|0]|d[s+5|0]<<8|d[s+6|0]<<16|d[s+7|0]<<24,+h[k>>3]);h[k>>3]=y,w=c[k>>2]|0,a[x]=w,w=w>>8,a[x+1|0]=w,w=w>>8,a[x+2|0]=w,w=w>>8,a[x+3|0]=w,w=c[k+4>>2]|0,a[x+4|0]=w,w=w>>8,a[x+5|0]=w,w=w>>8,a[x+6|0]=w,w=w>>8,a[x+7|0]=w;x=b+32|0;s=e+32|0;y=(c[k>>2]=d[s]|d[s+1|0]<<8|d[s+2|0]<<16|d[s+3|0]<<24,c[k+4>>2]=d[s+4|0]|d[s+5|0]<<8|d[s+6|0]<<16|d[s+7|0]<<24,+h[k>>3]);h[k>>3]=y,w=c[k>>2]|0,a[x]=w,w=w>>8,a[x+1|0]=w,w=w>>8,a[x+2|0]=w,w=w>>8,a[x+3|0]=w,w=c[k+4>>2]|0,a[x+4|0]=w,w=w>>8,a[x+5|0]=w,w=w>>8,a[x+6|0]=w,w=w>>8,a[x+7|0]=w;x=b+40|0;s=e+40|0;y=(c[k>>2]=d[s]|d[s+1|0]<<8|d[s+2|0]<<16|d[s+3|0]<<24,c[k+4>>2]=d[s+4|0]|d[s+5|0]<<8|d[s+6|0]<<16|d[s+7|0]<<24,+h[k>>3]);h[k>>3]=y,w=c[k>>2]|0,a[x]=w,w=w>>8,a[x+1|0]=w,w=w>>8,a[x+2|0]=w,w=w>>8,a[x+3|0]=w,w=c[k+4>>2]|0,a[x+4|0]=w,w=w>>8,a[x+5|0]=w,w=w>>8,a[x+6|0]=w,w=w>>8,a[x+7|0]=w;x=b+48|0;s=e+48|0;y=(c[k>>2]=d[s]|d[s+1|0]<<8|d[s+2|0]<<16|d[s+3|0]<<24,c[k+4>>2]=d[s+4|0]|d[s+5|0]<<8|d[s+6|0]<<16|d[s+7|0]<<24,+h[k>>3]);h[k>>3]=y,w=c[k>>2]|0,a[x]=w,w=w>>8,a[x+1|0]=w,w=w>>8,a[x+2|0]=w,w=w>>8,a[x+3|0]=w,w=c[k+4>>2]|0,a[x+4|0]=w,w=w>>8,a[x+5|0]=w,w=w>>8,a[x+6|0]=w,w=w>>8,a[x+7|0]=w;x=b+56|0;b=e+56|0;y=(c[k>>2]=d[b]|d[b+1|0]<<8|d[b+2|0]<<16|d[b+3|0]<<24,c[k+4>>2]=d[b+4|0]|d[b+5|0]<<8|d[b+6|0]<<16|d[b+7|0]<<24,+h[k>>3]);h[k>>3]=y,w=c[k>>2]|0,a[x]=w,w=w>>8,a[x+1|0]=w,w=w>>8,a[x+2|0]=w,w=w>>8,a[x+3|0]=w,w=c[k+4>>2]|0,a[x+4|0]=w,w=w>>8,a[x+5|0]=w,w=w>>8,a[x+6|0]=w,w=w>>8,a[x+7|0]=w;x=u+3|0;b=x<<3;c[i>>2]=ob(b)|0;c[j>>2]=ob(b)|0;c[l>>2]=ob(b)|0;b=x<<2;s=ob(b)|0;c[m>>2]=s;c[n>>2]=ob(b)|0;c[o>>2]=qb(8,x)|0;c[p>>2]=qb(8,x)|0;c[q>>2]=qb(8,x)|0;c[r>>2]=qb(8,x)|0;b=e+64|0;z=aa(v,v)|0;if((x|0)>0){v=(u<<6)+256|0;u=b;A=0;B=s;while(1){s=B+(A<<2)|0;C=u;w=d[C]|d[C+1|0]<<8|d[C+2|0]<<16|d[C+3|0]<<24|0;a[s]=w;w=w>>8;a[s+1|0]=w;w=w>>8;a[s+2|0]=w;w=w>>8;a[s+3|0]=w;s=(c[n>>2]|0)+(A<<2)|0;C=u+4|0;w=d[C]|d[C+1|0]<<8|d[C+2|0]<<16|d[C+3|0]<<24|0;a[s]=w;w=w>>8;a[s+1|0]=w;w=w>>8;a[s+2|0]=w;w=w>>8;a[s+3|0]=w;s=(c[i>>2]|0)+(A<<3)|0;C=u+8|0;y=(c[k>>2]=d[C]|d[C+1|0]<<8|d[C+2|0]<<16|d[C+3|0]<<24,c[k+4>>2]=d[C+4|0]|d[C+5|0]<<8|d[C+6|0]<<16|d[C+7|0]<<24,+h[k>>3]);h[k>>3]=y,w=c[k>>2]|0,a[s]=w,w=w>>8,a[s+1|0]=w,w=w>>8,a[s+2|0]=w,w=w>>8,a[s+3|0]=w,w=c[k+4>>2]|0,a[s+4|0]=w,w=w>>8,a[s+5|0]=w,w=w>>8,a[s+6|0]=w,w=w>>8,a[s+7|0]=w;s=(c[j>>2]|0)+(A<<3)|0;C=u+16|0;y=(c[k>>2]=d[C]|d[C+1|0]<<8|d[C+2|0]<<16|d[C+3|0]<<24,c[k+4>>2]=d[C+4|0]|d[C+5|0]<<8|d[C+6|0]<<16|d[C+7|0]<<24,+h[k>>3]);h[k>>3]=y,w=c[k>>2]|0,a[s]=w,w=w>>8,a[s+1|0]=w,w=w>>8,a[s+2|0]=w,w=w>>8,a[s+3|0]=w,w=c[k+4>>2]|0,a[s+4|0]=w,w=w>>8,a[s+5|0]=w,w=w>>8,a[s+6|0]=w,w=w>>8,a[s+7|0]=w;s=(c[l>>2]|0)+(A<<3)|0;C=u+24|0;y=(c[k>>2]=d[C]|d[C+1|0]<<8|d[C+2|0]<<16|d[C+3|0]<<24,c[k+4>>2]=d[C+4|0]|d[C+5|0]<<8|d[C+6|0]<<16|d[C+7|0]<<24,+h[k>>3]);h[k>>3]=y,w=c[k>>2]|0,a[s]=w,w=w>>8,a[s+1|0]=w,w=w>>8,a[s+2|0]=w,w=w>>8,a[s+3|0]=w,w=c[k+4>>2]|0,a[s+4|0]=w,w=w>>8,a[s+5|0]=w,w=w>>8,a[s+6|0]=w,w=w>>8,a[s+7|0]=w;s=(c[o>>2]|0)+(A<<3)|0;C=u+32|0;y=(c[k>>2]=d[C]|d[C+1|0]<<8|d[C+2|0]<<16|d[C+3|0]<<24,c[k+4>>2]=d[C+4|0]|d[C+5|0]<<8|d[C+6|0]<<16|d[C+7|0]<<24,+h[k>>3]);h[k>>3]=y,w=c[k>>2]|0,a[s]=w,w=w>>8,a[s+1|0]=w,w=w>>8,a[s+2|0]=w,w=w>>8,a[s+3|0]=w,w=c[k+4>>2]|0,a[s+4|0]=w,w=w>>8,a[s+5|0]=w,w=w>>8,a[s+6|0]=w,w=w>>8,a[s+7|0]=w;s=(c[p>>2]|0)+(A<<3)|0;C=u+40|0;y=(c[k>>2]=d[C]|d[C+1|0]<<8|d[C+2|0]<<16|d[C+3|0]<<24,c[k+4>>2]=d[C+4|0]|d[C+5|0]<<8|d[C+6|0]<<16|d[C+7|0]<<24,+h[k>>3]);h[k>>3]=y,w=c[k>>2]|0,a[s]=w,w=w>>8,a[s+1|0]=w,w=w>>8,a[s+2|0]=w,w=w>>8,a[s+3|0]=w,w=c[k+4>>2]|0,a[s+4|0]=w,w=w>>8,a[s+5|0]=w,w=w>>8,a[s+6|0]=w,w=w>>8,a[s+7|0]=w;s=(c[q>>2]|0)+(A<<3)|0;C=u+48|0;y=(c[k>>2]=d[C]|d[C+1|0]<<8|d[C+2|0]<<16|d[C+3|0]<<24,c[k+4>>2]=d[C+4|0]|d[C+5|0]<<8|d[C+6|0]<<16|d[C+7|0]<<24,+h[k>>3]);h[k>>3]=y,w=c[k>>2]|0,a[s]=w,w=w>>8,a[s+1|0]=w,w=w>>8,a[s+2|0]=w,w=w>>8,a[s+3|0]=w,w=c[k+4>>2]|0,a[s+4|0]=w,w=w>>8,a[s+5|0]=w,w=w>>8,a[s+6|0]=w,w=w>>8,a[s+7|0]=w;s=(c[r>>2]|0)+(A<<3)|0;C=u+56|0;y=(c[k>>2]=d[C]|d[C+1|0]<<8|d[C+2|0]<<16|d[C+3|0]<<24,c[k+4>>2]=d[C+4|0]|d[C+5|0]<<8|d[C+6|0]<<16|d[C+7|0]<<24,+h[k>>3]);h[k>>3]=y,w=c[k>>2]|0,a[s]=w,w=w>>8,a[s+1|0]=w,w=w>>8,a[s+2|0]=w,w=w>>8,a[s+3|0]=w,w=c[k+4>>2]|0,a[s+4|0]=w,w=w>>8,a[s+5|0]=w,w=w>>8,a[s+6|0]=w,w=w>>8,a[s+7|0]=w;s=A+1|0;if((s|0)>=(x|0)){break}u=u+64|0;A=s;B=c[m>>2]|0}D=e+v|0}else{D=b}if((t|0)==0){E=D;return E|0}t=z<<3;b=ob(t)|0;c[f>>2]=b;c[g>>2]=ob(t)|0;if((z|0)==0){E=D;return E|0}t=(z|0)>1?z<<4:16;v=D;e=0;m=b;while(1){b=m+(e<<3)|0;B=v;y=(c[k>>2]=d[B]|d[B+1|0]<<8|d[B+2|0]<<16|d[B+3|0]<<24,c[k+4>>2]=d[B+4|0]|d[B+5|0]<<8|d[B+6|0]<<16|d[B+7|0]<<24,+h[k>>3]);h[k>>3]=y,w=c[k>>2]|0,a[b]=w,w=w>>8,a[b+1|0]=w,w=w>>8,a[b+2|0]=w,w=w>>8,a[b+3|0]=w,w=c[k+4>>2]|0,a[b+4|0]=w,w=w>>8,a[b+5|0]=w,w=w>>8,a[b+6|0]=w,w=w>>8,a[b+7|0]=w;b=(c[g>>2]|0)+(e<<3)|0;B=v+8|0;y=(c[k>>2]=d[B]|d[B+1|0]<<8|d[B+2|0]<<16|d[B+3|0]<<24,c[k+4>>2]=d[B+4|0]|d[B+5|0]<<8|d[B+6|0]<<16|d[B+7|0]<<24,+h[k>>3]);h[k>>3]=y,w=c[k>>2]|0,a[b]=w,w=w>>8,a[b+1|0]=w,w=w>>8,a[b+2|0]=w,w=w>>8,a[b+3|0]=w,w=c[k+4>>2]|0,a[b+4|0]=w,w=w>>8,a[b+5|0]=w,w=w>>8,a[b+6|0]=w,w=w>>8,a[b+7|0]=w;b=e+1|0;if((b|0)>=(z|0)){break}v=v+16|0;e=b;m=c[f>>2]|0}E=D+t|0;return E|0}function ob(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,la=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ga=0,Ha=0,Ja=0,Ka=0,La=0;do{if(a>>>0<245>>>0){if(a>>>0<11>>>0){b=16}else{b=a+11&-8}d=b>>>3;e=c[78]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=352+(h<<2)|0;j=352+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[78]=e&~(1<<g)}else{if(l>>>0<(c[82]|0)>>>0){ma();return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{ma();return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[80]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=352+(p<<2)|0;m=352+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[78]=e&~(1<<r)}else{if(l>>>0<(c[82]|0)>>>0){ma();return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{ma();return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[80]|0;if((l|0)!=0){q=c[83]|0;d=l>>>3;l=d<<1;f=352+(l<<2)|0;k=c[78]|0;h=1<<d;do{if((k&h|0)==0){c[78]=k|h;s=f;t=352+(l+2<<2)|0}else{d=352+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[82]|0)>>>0){s=g;t=d;break}ma();return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[80]=m;c[83]=e;n=i;return n|0}l=c[79]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[616+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[82]|0;if(r>>>0<i>>>0){ma();return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){ma();return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break}else{w=l;x=k}}else{w=g;x=q}while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){ma();return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){ma();return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){ma();return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{ma();return 0}}}while(0);a:do{if((e|0)!=0){f=d+28|0;i=616+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[79]=c[79]&~(1<<c[f>>2]);break a}else{if(e>>>0<(c[82]|0)>>>0){ma();return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break a}}}while(0);if(v>>>0<(c[82]|0)>>>0){ma();return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[82]|0)>>>0){ma();return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[82]|0)>>>0){ma();return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16>>>0){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b)>>2]=p;f=c[80]|0;if((f|0)!=0){e=c[83]|0;i=f>>>3;f=i<<1;q=352+(f<<2)|0;k=c[78]|0;g=1<<i;do{if((k&g|0)==0){c[78]=k|g;y=q;z=352+(f+2<<2)|0}else{i=352+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[82]|0)>>>0){y=l;z=i;break}ma();return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[80]=p;c[83]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231>>>0){o=-1;break}f=a+11|0;g=f&-8;k=c[79]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215>>>0){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=14-(h|f|l)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[616+(A<<2)>>2]|0;b:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break b}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[616+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break}else{p=r;m=i;q=e}}}if((K|0)==0){o=g;break}if(J>>>0>=((c[80]|0)-g|0)>>>0){o=g;break}q=K;m=c[82]|0;if(q>>>0<m>>>0){ma();return 0}p=q+g|0;k=p;if(q>>>0>=p>>>0){ma();return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break}else{M=B;N=j}}else{M=d;N=r}while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<m>>>0){ma();return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<m>>>0){ma();return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){ma();return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{ma();return 0}}}while(0);c:do{if((e|0)!=0){i=K+28|0;m=616+(c[i>>2]<<2)|0;do{if((K|0)==(c[m>>2]|0)){c[m>>2]=L;if((L|0)!=0){break}c[79]=c[79]&~(1<<c[i>>2]);break c}else{if(e>>>0<(c[82]|0)>>>0){ma();return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break c}}}while(0);if(L>>>0<(c[82]|0)>>>0){ma();return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[82]|0)>>>0){ma();return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[82]|0)>>>0){ma();return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16>>>0){e=J+g|0;c[K+4>>2]=e|3;i=q+(e+4)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[q+(g|4)>>2]=J|1;c[q+(J+g)>>2]=J;i=J>>>3;if(J>>>0<256>>>0){e=i<<1;m=352+(e<<2)|0;r=c[78]|0;j=1<<i;do{if((r&j|0)==0){c[78]=r|j;O=m;P=352+(e+2<<2)|0}else{i=352+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[82]|0)>>>0){O=d;P=i;break}ma();return 0}}while(0);c[P>>2]=k;c[O+12>>2]=k;c[q+(g+8)>>2]=O;c[q+(g+12)>>2]=m;break}e=p;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215>>>0){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=14-(d|r|i)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=616+(Q<<2)|0;c[q+(g+28)>>2]=Q;c[q+(g+20)>>2]=0;c[q+(g+16)>>2]=0;m=c[79]|0;l=1<<Q;if((m&l|0)==0){c[79]=m|l;c[j>>2]=e;c[q+(g+24)>>2]=j;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;m=c[j>>2]|0;while(1){if((c[m+4>>2]&-8|0)==(J|0)){break}S=m+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=151;break}else{l=l<<1;m=j}}if((T|0)==151){if(S>>>0<(c[82]|0)>>>0){ma();return 0}else{c[S>>2]=e;c[q+(g+24)>>2]=m;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}}l=m+8|0;j=c[l>>2]|0;i=c[82]|0;if(m>>>0<i>>>0){ma();return 0}if(j>>>0<i>>>0){ma();return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[q+(g+8)>>2]=j;c[q+(g+12)>>2]=m;c[q+(g+24)>>2]=0;break}}}while(0);q=K+8|0;if((q|0)==0){o=g;break}else{n=q}return n|0}}while(0);K=c[80]|0;if(o>>>0<=K>>>0){S=K-o|0;J=c[83]|0;if(S>>>0>15>>>0){R=J;c[83]=R+o;c[80]=S;c[R+(o+4)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[80]=0;c[83]=0;c[J+4>>2]=K|3;S=J+(K+4)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[81]|0;if(o>>>0<J>>>0){S=J-o|0;c[81]=S;J=c[84]|0;K=J;c[84]=K+o;c[K+(o+4)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[72]|0)==0){J=ka(30)|0;if((J-1&J|0)==0){c[74]=J;c[73]=J;c[75]=-1;c[76]=-1;c[77]=0;c[189]=0;c[72]=(Ia(0)|0)&-16^1431655768;break}else{ma();return 0}}}while(0);J=o+48|0;S=c[74]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(S>>>0<=o>>>0){n=0;return n|0}O=c[188]|0;do{if((O|0)!=0){P=c[186]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);d:do{if((c[189]&4|0)==0){O=c[84]|0;e:do{if((O|0)==0){T=181}else{L=O;P=760;while(1){U=P|0;M=c[U>>2]|0;if(M>>>0<=L>>>0){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=181;break e}else{P=M}}if((P|0)==0){T=181;break}L=R-(c[81]|0)&Q;if(L>>>0>=2147483647>>>0){W=0;break}m=Ea(L|0)|0;e=(m|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?m:-1;Y=e?L:0;Z=m;_=L;T=190}}while(0);do{if((T|0)==181){O=Ea(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[73]|0;m=L-1|0;if((m&g|0)==0){$=S}else{$=S-g+(m+g&-L)|0}L=c[186]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647>>>0)){W=0;break}m=c[188]|0;if((m|0)!=0){if(g>>>0<=L>>>0|g>>>0>m>>>0){W=0;break}}m=Ea($|0)|0;g=(m|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=m;_=$;T=190}}while(0);f:do{if((T|0)==190){m=-_|0;if((X|0)!=-1){aa=Y;ba=X;T=201;break d}do{if((Z|0)!=-1&_>>>0<2147483647>>>0&_>>>0<J>>>0){g=c[74]|0;O=K-_+g&-g;if(O>>>0>=2147483647>>>0){ca=_;break}if((Ea(O|0)|0)==-1){Ea(m|0)|0;W=Y;break f}else{ca=O+_|0;break}}else{ca=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ca;ba=Z;T=201;break d}}}while(0);c[189]=c[189]|4;da=W;T=198}else{da=0;T=198}}while(0);do{if((T|0)==198){if(S>>>0>=2147483647>>>0){break}W=Ea(S|0)|0;Z=Ea(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ca=Z-W|0;Z=ca>>>0>(o+40|0)>>>0;Y=Z?W:-1;if((Y|0)!=-1){aa=Z?ca:da;ba=Y;T=201}}}while(0);do{if((T|0)==201){da=(c[186]|0)+aa|0;c[186]=da;if(da>>>0>(c[187]|0)>>>0){c[187]=da}da=c[84]|0;g:do{if((da|0)==0){S=c[82]|0;if((S|0)==0|ba>>>0<S>>>0){c[82]=ba}c[190]=ba;c[191]=aa;c[193]=0;c[87]=c[72];c[86]=-1;S=0;do{Y=S<<1;ca=352+(Y<<2)|0;c[352+(Y+3<<2)>>2]=ca;c[352+(Y+2<<2)>>2]=ca;S=S+1|0;}while(S>>>0<32>>>0);S=ba+8|0;if((S&7|0)==0){ea=0}else{ea=-S&7}S=aa-40-ea|0;c[84]=ba+ea;c[81]=S;c[ba+(ea+4)>>2]=S|1;c[ba+(aa-36)>>2]=40;c[85]=c[76]}else{S=760;while(1){fa=c[S>>2]|0;ga=S+4|0;ha=c[ga>>2]|0;if((ba|0)==(fa+ha|0)){T=213;break}ca=c[S+8>>2]|0;if((ca|0)==0){break}else{S=ca}}do{if((T|0)==213){if((c[S+12>>2]&8|0)!=0){break}ca=da;if(!(ca>>>0>=fa>>>0&ca>>>0<ba>>>0)){break}c[ga>>2]=ha+aa;ca=c[84]|0;Y=(c[81]|0)+aa|0;Z=ca;W=ca+8|0;if((W&7|0)==0){ia=0}else{ia=-W&7}W=Y-ia|0;c[84]=Z+ia;c[81]=W;c[Z+(ia+4)>>2]=W|1;c[Z+(Y+4)>>2]=40;c[85]=c[76];break g}}while(0);if(ba>>>0<(c[82]|0)>>>0){c[82]=ba}S=ba+aa|0;Y=760;while(1){ja=Y|0;if((c[ja>>2]|0)==(S|0)){T=223;break}Z=c[Y+8>>2]|0;if((Z|0)==0){break}else{Y=Z}}do{if((T|0)==223){if((c[Y+12>>2]&8|0)!=0){break}c[ja>>2]=ba;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa;S=ba+8|0;if((S&7|0)==0){la=0}else{la=-S&7}S=ba+(aa+8)|0;if((S&7|0)==0){na=0}else{na=-S&7}S=ba+(na+aa)|0;Z=S;W=la+o|0;ca=ba+W|0;_=ca;K=S-(ba+la)-o|0;c[ba+(la+4)>>2]=o|3;do{if((Z|0)==(c[84]|0)){J=(c[81]|0)+K|0;c[81]=J;c[84]=_;c[ba+(W+4)>>2]=J|1}else{if((Z|0)==(c[83]|0)){J=(c[80]|0)+K|0;c[80]=J;c[83]=_;c[ba+(W+4)>>2]=J|1;c[ba+(J+W)>>2]=J;break}J=aa+4|0;X=c[ba+(J+na)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;h:do{if(X>>>0<256>>>0){U=c[ba+((na|8)+aa)>>2]|0;Q=c[ba+(aa+12+na)>>2]|0;R=352+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[82]|0)>>>0){ma();return 0}if((c[U+12>>2]|0)==(Z|0)){break}ma();return 0}}while(0);if((Q|0)==(U|0)){c[78]=c[78]&~(1<<V);break}do{if((Q|0)==(R|0)){oa=Q+8|0}else{if(Q>>>0<(c[82]|0)>>>0){ma();return 0}m=Q+8|0;if((c[m>>2]|0)==(Z|0)){oa=m;break}ma();return 0}}while(0);c[U+12>>2]=Q;c[oa>>2]=U}else{R=S;m=c[ba+((na|24)+aa)>>2]|0;P=c[ba+(aa+12+na)>>2]|0;do{if((P|0)==(R|0)){O=na|16;g=ba+(J+O)|0;L=c[g>>2]|0;if((L|0)==0){e=ba+(O+aa)|0;O=c[e>>2]|0;if((O|0)==0){pa=0;break}else{qa=O;ra=e}}else{qa=L;ra=g}while(1){g=qa+20|0;L=c[g>>2]|0;if((L|0)!=0){qa=L;ra=g;continue}g=qa+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{qa=L;ra=g}}if(ra>>>0<(c[82]|0)>>>0){ma();return 0}else{c[ra>>2]=0;pa=qa;break}}else{g=c[ba+((na|8)+aa)>>2]|0;if(g>>>0<(c[82]|0)>>>0){ma();return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){ma();return 0}e=P+8|0;if((c[e>>2]|0)==(R|0)){c[L>>2]=P;c[e>>2]=g;pa=P;break}else{ma();return 0}}}while(0);if((m|0)==0){break}P=ba+(aa+28+na)|0;U=616+(c[P>>2]<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=pa;if((pa|0)!=0){break}c[79]=c[79]&~(1<<c[P>>2]);break h}else{if(m>>>0<(c[82]|0)>>>0){ma();return 0}Q=m+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=pa}else{c[m+20>>2]=pa}if((pa|0)==0){break h}}}while(0);if(pa>>>0<(c[82]|0)>>>0){ma();return 0}c[pa+24>>2]=m;R=na|16;P=c[ba+(R+aa)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[82]|0)>>>0){ma();return 0}else{c[pa+16>>2]=P;c[P+24>>2]=pa;break}}}while(0);P=c[ba+(J+R)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[82]|0)>>>0){ma();return 0}else{c[pa+20>>2]=P;c[P+24>>2]=pa;break}}}while(0);sa=ba+(($|na)+aa)|0;ta=$+K|0}else{sa=Z;ta=K}J=sa+4|0;c[J>>2]=c[J>>2]&-2;c[ba+(W+4)>>2]=ta|1;c[ba+(ta+W)>>2]=ta;J=ta>>>3;if(ta>>>0<256>>>0){V=J<<1;X=352+(V<<2)|0;P=c[78]|0;m=1<<J;do{if((P&m|0)==0){c[78]=P|m;ua=X;va=352+(V+2<<2)|0}else{J=352+(V+2<<2)|0;U=c[J>>2]|0;if(U>>>0>=(c[82]|0)>>>0){ua=U;va=J;break}ma();return 0}}while(0);c[va>>2]=_;c[ua+12>>2]=_;c[ba+(W+8)>>2]=ua;c[ba+(W+12)>>2]=X;break}V=ca;m=ta>>>8;do{if((m|0)==0){wa=0}else{if(ta>>>0>16777215>>>0){wa=31;break}P=(m+1048320|0)>>>16&8;$=m<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=14-(J|P|$)+(U<<$>>>15)|0;wa=ta>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=616+(wa<<2)|0;c[ba+(W+28)>>2]=wa;c[ba+(W+20)>>2]=0;c[ba+(W+16)>>2]=0;X=c[79]|0;Q=1<<wa;if((X&Q|0)==0){c[79]=X|Q;c[m>>2]=V;c[ba+(W+24)>>2]=m;c[ba+(W+12)>>2]=V;c[ba+(W+8)>>2]=V;break}if((wa|0)==31){xa=0}else{xa=25-(wa>>>1)|0}Q=ta<<xa;X=c[m>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(ta|0)){break}ya=X+16+(Q>>>31<<2)|0;m=c[ya>>2]|0;if((m|0)==0){T=296;break}else{Q=Q<<1;X=m}}if((T|0)==296){if(ya>>>0<(c[82]|0)>>>0){ma();return 0}else{c[ya>>2]=V;c[ba+(W+24)>>2]=X;c[ba+(W+12)>>2]=V;c[ba+(W+8)>>2]=V;break}}Q=X+8|0;m=c[Q>>2]|0;$=c[82]|0;if(X>>>0<$>>>0){ma();return 0}if(m>>>0<$>>>0){ma();return 0}else{c[m+12>>2]=V;c[Q>>2]=V;c[ba+(W+8)>>2]=m;c[ba+(W+12)>>2]=X;c[ba+(W+24)>>2]=0;break}}}while(0);n=ba+(la|8)|0;return n|0}}while(0);Y=da;W=760;while(1){za=c[W>>2]|0;if(za>>>0<=Y>>>0){Aa=c[W+4>>2]|0;Ba=za+Aa|0;if(Ba>>>0>Y>>>0){break}}W=c[W+8>>2]|0}W=za+(Aa-39)|0;if((W&7|0)==0){Ca=0}else{Ca=-W&7}W=za+(Aa-47+Ca)|0;ca=W>>>0<(da+16|0)>>>0?Y:W;W=ca+8|0;_=ba+8|0;if((_&7|0)==0){Da=0}else{Da=-_&7}_=aa-40-Da|0;c[84]=ba+Da;c[81]=_;c[ba+(Da+4)>>2]=_|1;c[ba+(aa-36)>>2]=40;c[85]=c[76];c[ca+4>>2]=27;c[W>>2]=c[190];c[W+4>>2]=c[191];c[W+8>>2]=c[192];c[W+12>>2]=c[193];c[190]=ba;c[191]=aa;c[193]=0;c[192]=W;W=ca+28|0;c[W>>2]=7;if((ca+32|0)>>>0<Ba>>>0){_=W;while(1){W=_+4|0;c[W>>2]=7;if((_+8|0)>>>0<Ba>>>0){_=W}else{break}}}if((ca|0)==(Y|0)){break}_=ca-da|0;W=Y+(_+4)|0;c[W>>2]=c[W>>2]&-2;c[da+4>>2]=_|1;c[Y+_>>2]=_;W=_>>>3;if(_>>>0<256>>>0){K=W<<1;Z=352+(K<<2)|0;S=c[78]|0;m=1<<W;do{if((S&m|0)==0){c[78]=S|m;Ga=Z;Ha=352+(K+2<<2)|0}else{W=352+(K+2<<2)|0;Q=c[W>>2]|0;if(Q>>>0>=(c[82]|0)>>>0){Ga=Q;Ha=W;break}ma();return 0}}while(0);c[Ha>>2]=da;c[Ga+12>>2]=da;c[da+8>>2]=Ga;c[da+12>>2]=Z;break}K=da;m=_>>>8;do{if((m|0)==0){Ja=0}else{if(_>>>0>16777215>>>0){Ja=31;break}S=(m+1048320|0)>>>16&8;Y=m<<S;ca=(Y+520192|0)>>>16&4;W=Y<<ca;Y=(W+245760|0)>>>16&2;Q=14-(ca|S|Y)+(W<<Y>>>15)|0;Ja=_>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=616+(Ja<<2)|0;c[da+28>>2]=Ja;c[da+20>>2]=0;c[da+16>>2]=0;Z=c[79]|0;Q=1<<Ja;if((Z&Q|0)==0){c[79]=Z|Q;c[m>>2]=K;c[da+24>>2]=m;c[da+12>>2]=da;c[da+8>>2]=da;break}if((Ja|0)==31){Ka=0}else{Ka=25-(Ja>>>1)|0}Q=_<<Ka;Z=c[m>>2]|0;while(1){if((c[Z+4>>2]&-8|0)==(_|0)){break}La=Z+16+(Q>>>31<<2)|0;m=c[La>>2]|0;if((m|0)==0){T=331;break}else{Q=Q<<1;Z=m}}if((T|0)==331){if(La>>>0<(c[82]|0)>>>0){ma();return 0}else{c[La>>2]=K;c[da+24>>2]=Z;c[da+12>>2]=da;c[da+8>>2]=da;break}}Q=Z+8|0;_=c[Q>>2]|0;m=c[82]|0;if(Z>>>0<m>>>0){ma();return 0}if(_>>>0<m>>>0){ma();return 0}else{c[_+12>>2]=K;c[Q>>2]=K;c[da+8>>2]=_;c[da+12>>2]=Z;c[da+24>>2]=0;break}}}while(0);da=c[81]|0;if(da>>>0<=o>>>0){break}_=da-o|0;c[81]=_;da=c[84]|0;Q=da;c[84]=Q+o;c[Q+(o+4)>>2]=_|1;c[da+4>>2]=o|3;n=da+8|0;return n|0}}while(0);c[(Fa()|0)>>2]=12;n=0;return n|0}function pb(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[82]|0;if(b>>>0<e>>>0){ma()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){ma()}h=f&-8;i=a+(h-8)|0;j=i;a:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){ma()}if((n|0)==(c[83]|0)){p=a+(h-4)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[80]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256>>>0){k=c[a+(l+8)>>2]|0;s=c[a+(l+12)>>2]|0;t=352+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){ma()}if((c[k+12>>2]|0)==(n|0)){break}ma()}}while(0);if((s|0)==(k|0)){c[78]=c[78]&~(1<<p);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){ma()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}ma()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24)>>2]|0;v=c[a+(l+12)>>2]|0;do{if((v|0)==(t|0)){w=a+(l+20)|0;x=c[w>>2]|0;if((x|0)==0){y=a+(l+16)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){ma()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8)>>2]|0;if(w>>>0<e>>>0){ma()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){ma()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{ma()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28)|0;m=616+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[79]=c[79]&~(1<<c[v>>2]);q=n;r=o;break a}else{if(p>>>0<(c[82]|0)>>>0){ma()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break a}}}while(0);if(A>>>0<(c[82]|0)>>>0){ma()}c[A+24>>2]=p;t=c[a+(l+16)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[82]|0)>>>0){ma()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[82]|0)>>>0){ma()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){ma()}A=a+(h-4)|0;e=c[A>>2]|0;if((e&1|0)==0){ma()}do{if((e&2|0)==0){if((j|0)==(c[84]|0)){B=(c[81]|0)+r|0;c[81]=B;c[84]=q;c[q+4>>2]=B|1;if((q|0)!=(c[83]|0)){return}c[83]=0;c[80]=0;return}if((j|0)==(c[83]|0)){B=(c[80]|0)+r|0;c[80]=B;c[83]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;b:do{if(e>>>0<256>>>0){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=352+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[82]|0)>>>0){ma()}if((c[u+12>>2]|0)==(j|0)){break}ma()}}while(0);if((g|0)==(u|0)){c[78]=c[78]&~(1<<C);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[82]|0)>>>0){ma()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}ma()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16)>>2]|0;t=c[a+(h|4)>>2]|0;do{if((t|0)==(b|0)){p=a+(h+12)|0;v=c[p>>2]|0;if((v|0)==0){m=a+(h+8)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break}else{F=k;G=m}}else{F=v;G=p}while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[82]|0)>>>0){ma()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[82]|0)>>>0){ma()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){ma()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{ma()}}}while(0);if((f|0)==0){break}t=a+(h+20)|0;u=616+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[79]=c[79]&~(1<<c[t>>2]);break b}else{if(f>>>0<(c[82]|0)>>>0){ma()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break b}}}while(0);if(E>>>0<(c[82]|0)>>>0){ma()}c[E+24>>2]=f;b=c[a+(h+8)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[82]|0)>>>0){ma()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[82]|0)>>>0){ma()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[83]|0)){H=B;break}c[80]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256>>>0){d=r<<1;e=352+(d<<2)|0;A=c[78]|0;E=1<<r;do{if((A&E|0)==0){c[78]=A|E;I=e;J=352+(d+2<<2)|0}else{r=352+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[82]|0)>>>0){I=h;J=r;break}ma()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215>>>0){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=14-(E|J|d)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=616+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[79]|0;d=1<<K;do{if((r&d|0)==0){c[79]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=129;break}else{A=A<<1;J=E}}if((N|0)==129){if(M>>>0<(c[82]|0)>>>0){ma()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[82]|0;if(J>>>0<E>>>0){ma()}if(B>>>0<E>>>0){ma()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[86]|0)-1|0;c[86]=q;if((q|0)==0){O=768}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[86]=-1;return}function qb(a,b){a=a|0;b=b|0;var d=0,e=0;do{if((a|0)==0){d=0}else{e=aa(b,a)|0;if((b|a)>>>0<=65535>>>0){d=e;break}d=((e>>>0)/(a>>>0)|0|0)==(b|0)?e:-1}}while(0);b=ob(d)|0;if((b|0)==0){return b|0}if((c[b-4>>2]&3|0)==0){return b|0}Cb(b|0,0,d|0)|0;return b|0}function rb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;if((a|0)==0){d=ob(b)|0;return d|0}if(b>>>0>4294967231>>>0){c[(Fa()|0)>>2]=12;d=0;return d|0}if(b>>>0<11>>>0){e=16}else{e=b+11&-8}f=sb(a-8|0,e)|0;if((f|0)!=0){d=f+8|0;return d|0}f=ob(b)|0;if((f|0)==0){d=0;return d|0}e=c[a-4>>2]|0;g=(e&-8)-((e&3|0)==0?8:4)|0;Bb(f|0,a|0,g>>>0<b>>>0?g:b)|0;pb(a);d=f;return d|0}function sb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=a+4|0;e=c[d>>2]|0;f=e&-8;g=a;h=g+f|0;i=h;j=c[82]|0;if(g>>>0<j>>>0){ma();return 0}k=e&3;if(!((k|0)!=1&g>>>0<h>>>0)){ma();return 0}l=g+(f|4)|0;m=c[l>>2]|0;if((m&1|0)==0){ma();return 0}if((k|0)==0){if(b>>>0<256>>>0){n=0;return n|0}do{if(f>>>0>=(b+4|0)>>>0){if((f-b|0)>>>0>c[74]<<1>>>0){break}else{n=a}return n|0}}while(0);n=0;return n|0}if(f>>>0>=b>>>0){k=f-b|0;if(k>>>0<=15>>>0){n=a;return n|0}c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|3;c[l>>2]=c[l>>2]|1;tb(g+b|0,k);n=a;return n|0}if((i|0)==(c[84]|0)){k=(c[81]|0)+f|0;if(k>>>0<=b>>>0){n=0;return n|0}l=k-b|0;c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=l|1;c[84]=g+b;c[81]=l;n=a;return n|0}if((i|0)==(c[83]|0)){l=(c[80]|0)+f|0;if(l>>>0<b>>>0){n=0;return n|0}k=l-b|0;if(k>>>0>15>>>0){c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|1;c[g+l>>2]=k;o=g+(l+4)|0;c[o>>2]=c[o>>2]&-2;p=g+b|0;q=k}else{c[d>>2]=e&1|l|2;e=g+(l+4)|0;c[e>>2]=c[e>>2]|1;p=0;q=0}c[80]=q;c[83]=p;n=a;return n|0}if((m&2|0)!=0){n=0;return n|0}p=(m&-8)+f|0;if(p>>>0<b>>>0){n=0;return n|0}q=p-b|0;e=m>>>3;a:do{if(m>>>0<256>>>0){l=c[g+(f+8)>>2]|0;k=c[g+(f+12)>>2]|0;o=352+(e<<1<<2)|0;do{if((l|0)!=(o|0)){if(l>>>0<j>>>0){ma();return 0}if((c[l+12>>2]|0)==(i|0)){break}ma();return 0}}while(0);if((k|0)==(l|0)){c[78]=c[78]&~(1<<e);break}do{if((k|0)==(o|0)){r=k+8|0}else{if(k>>>0<j>>>0){ma();return 0}s=k+8|0;if((c[s>>2]|0)==(i|0)){r=s;break}ma();return 0}}while(0);c[l+12>>2]=k;c[r>>2]=l}else{o=h;s=c[g+(f+24)>>2]|0;t=c[g+(f+12)>>2]|0;do{if((t|0)==(o|0)){u=g+(f+20)|0;v=c[u>>2]|0;if((v|0)==0){w=g+(f+16)|0;x=c[w>>2]|0;if((x|0)==0){y=0;break}else{z=x;A=w}}else{z=v;A=u}while(1){u=z+20|0;v=c[u>>2]|0;if((v|0)!=0){z=v;A=u;continue}u=z+16|0;v=c[u>>2]|0;if((v|0)==0){break}else{z=v;A=u}}if(A>>>0<j>>>0){ma();return 0}else{c[A>>2]=0;y=z;break}}else{u=c[g+(f+8)>>2]|0;if(u>>>0<j>>>0){ma();return 0}v=u+12|0;if((c[v>>2]|0)!=(o|0)){ma();return 0}w=t+8|0;if((c[w>>2]|0)==(o|0)){c[v>>2]=t;c[w>>2]=u;y=t;break}else{ma();return 0}}}while(0);if((s|0)==0){break}t=g+(f+28)|0;l=616+(c[t>>2]<<2)|0;do{if((o|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[79]=c[79]&~(1<<c[t>>2]);break a}else{if(s>>>0<(c[82]|0)>>>0){ma();return 0}k=s+16|0;if((c[k>>2]|0)==(o|0)){c[k>>2]=y}else{c[s+20>>2]=y}if((y|0)==0){break a}}}while(0);if(y>>>0<(c[82]|0)>>>0){ma();return 0}c[y+24>>2]=s;o=c[g+(f+16)>>2]|0;do{if((o|0)!=0){if(o>>>0<(c[82]|0)>>>0){ma();return 0}else{c[y+16>>2]=o;c[o+24>>2]=y;break}}}while(0);o=c[g+(f+20)>>2]|0;if((o|0)==0){break}if(o>>>0<(c[82]|0)>>>0){ma();return 0}else{c[y+20>>2]=o;c[o+24>>2]=y;break}}}while(0);if(q>>>0<16>>>0){c[d>>2]=p|c[d>>2]&1|2;y=g+(p|4)|0;c[y>>2]=c[y>>2]|1;n=a;return n|0}else{c[d>>2]=c[d>>2]&1|b|2;c[g+(b+4)>>2]=q|3;d=g+(p|4)|0;c[d>>2]=c[d>>2]|1;tb(g+b|0,q);n=a;return n|0}return 0}function tb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;d=a;e=d+b|0;f=e;g=c[a+4>>2]|0;a:do{if((g&1|0)==0){h=c[a>>2]|0;if((g&3|0)==0){return}i=d+(-h|0)|0;j=i;k=h+b|0;l=c[82]|0;if(i>>>0<l>>>0){ma()}if((j|0)==(c[83]|0)){m=d+(b+4)|0;if((c[m>>2]&3|0)!=3){n=j;o=k;break}c[80]=k;c[m>>2]=c[m>>2]&-2;c[d+(4-h)>>2]=k|1;c[e>>2]=k;return}m=h>>>3;if(h>>>0<256>>>0){p=c[d+(8-h)>>2]|0;q=c[d+(12-h)>>2]|0;r=352+(m<<1<<2)|0;do{if((p|0)!=(r|0)){if(p>>>0<l>>>0){ma()}if((c[p+12>>2]|0)==(j|0)){break}ma()}}while(0);if((q|0)==(p|0)){c[78]=c[78]&~(1<<m);n=j;o=k;break}do{if((q|0)==(r|0)){s=q+8|0}else{if(q>>>0<l>>>0){ma()}t=q+8|0;if((c[t>>2]|0)==(j|0)){s=t;break}ma()}}while(0);c[p+12>>2]=q;c[s>>2]=p;n=j;o=k;break}r=i;m=c[d+(24-h)>>2]|0;t=c[d+(12-h)>>2]|0;do{if((t|0)==(r|0)){u=16-h|0;v=d+(u+4)|0;w=c[v>>2]|0;if((w|0)==0){x=d+u|0;u=c[x>>2]|0;if((u|0)==0){y=0;break}else{z=u;A=x}}else{z=w;A=v}while(1){v=z+20|0;w=c[v>>2]|0;if((w|0)!=0){z=w;A=v;continue}v=z+16|0;w=c[v>>2]|0;if((w|0)==0){break}else{z=w;A=v}}if(A>>>0<l>>>0){ma()}else{c[A>>2]=0;y=z;break}}else{v=c[d+(8-h)>>2]|0;if(v>>>0<l>>>0){ma()}w=v+12|0;if((c[w>>2]|0)!=(r|0)){ma()}x=t+8|0;if((c[x>>2]|0)==(r|0)){c[w>>2]=t;c[x>>2]=v;y=t;break}else{ma()}}}while(0);if((m|0)==0){n=j;o=k;break}t=d+(28-h)|0;l=616+(c[t>>2]<<2)|0;do{if((r|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[79]=c[79]&~(1<<c[t>>2]);n=j;o=k;break a}else{if(m>>>0<(c[82]|0)>>>0){ma()}i=m+16|0;if((c[i>>2]|0)==(r|0)){c[i>>2]=y}else{c[m+20>>2]=y}if((y|0)==0){n=j;o=k;break a}}}while(0);if(y>>>0<(c[82]|0)>>>0){ma()}c[y+24>>2]=m;r=16-h|0;t=c[d+r>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[82]|0)>>>0){ma()}else{c[y+16>>2]=t;c[t+24>>2]=y;break}}}while(0);t=c[d+(r+4)>>2]|0;if((t|0)==0){n=j;o=k;break}if(t>>>0<(c[82]|0)>>>0){ma()}else{c[y+20>>2]=t;c[t+24>>2]=y;n=j;o=k;break}}else{n=a;o=b}}while(0);a=c[82]|0;if(e>>>0<a>>>0){ma()}y=d+(b+4)|0;z=c[y>>2]|0;do{if((z&2|0)==0){if((f|0)==(c[84]|0)){A=(c[81]|0)+o|0;c[81]=A;c[84]=n;c[n+4>>2]=A|1;if((n|0)!=(c[83]|0)){return}c[83]=0;c[80]=0;return}if((f|0)==(c[83]|0)){A=(c[80]|0)+o|0;c[80]=A;c[83]=n;c[n+4>>2]=A|1;c[n+A>>2]=A;return}A=(z&-8)+o|0;s=z>>>3;b:do{if(z>>>0<256>>>0){g=c[d+(b+8)>>2]|0;t=c[d+(b+12)>>2]|0;h=352+(s<<1<<2)|0;do{if((g|0)!=(h|0)){if(g>>>0<a>>>0){ma()}if((c[g+12>>2]|0)==(f|0)){break}ma()}}while(0);if((t|0)==(g|0)){c[78]=c[78]&~(1<<s);break}do{if((t|0)==(h|0)){B=t+8|0}else{if(t>>>0<a>>>0){ma()}m=t+8|0;if((c[m>>2]|0)==(f|0)){B=m;break}ma()}}while(0);c[g+12>>2]=t;c[B>>2]=g}else{h=e;m=c[d+(b+24)>>2]|0;l=c[d+(b+12)>>2]|0;do{if((l|0)==(h|0)){i=d+(b+20)|0;p=c[i>>2]|0;if((p|0)==0){q=d+(b+16)|0;v=c[q>>2]|0;if((v|0)==0){C=0;break}else{D=v;E=q}}else{D=p;E=i}while(1){i=D+20|0;p=c[i>>2]|0;if((p|0)!=0){D=p;E=i;continue}i=D+16|0;p=c[i>>2]|0;if((p|0)==0){break}else{D=p;E=i}}if(E>>>0<a>>>0){ma()}else{c[E>>2]=0;C=D;break}}else{i=c[d+(b+8)>>2]|0;if(i>>>0<a>>>0){ma()}p=i+12|0;if((c[p>>2]|0)!=(h|0)){ma()}q=l+8|0;if((c[q>>2]|0)==(h|0)){c[p>>2]=l;c[q>>2]=i;C=l;break}else{ma()}}}while(0);if((m|0)==0){break}l=d+(b+28)|0;g=616+(c[l>>2]<<2)|0;do{if((h|0)==(c[g>>2]|0)){c[g>>2]=C;if((C|0)!=0){break}c[79]=c[79]&~(1<<c[l>>2]);break b}else{if(m>>>0<(c[82]|0)>>>0){ma()}t=m+16|0;if((c[t>>2]|0)==(h|0)){c[t>>2]=C}else{c[m+20>>2]=C}if((C|0)==0){break b}}}while(0);if(C>>>0<(c[82]|0)>>>0){ma()}c[C+24>>2]=m;h=c[d+(b+16)>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[82]|0)>>>0){ma()}else{c[C+16>>2]=h;c[h+24>>2]=C;break}}}while(0);h=c[d+(b+20)>>2]|0;if((h|0)==0){break}if(h>>>0<(c[82]|0)>>>0){ma()}else{c[C+20>>2]=h;c[h+24>>2]=C;break}}}while(0);c[n+4>>2]=A|1;c[n+A>>2]=A;if((n|0)!=(c[83]|0)){F=A;break}c[80]=A;return}else{c[y>>2]=z&-2;c[n+4>>2]=o|1;c[n+o>>2]=o;F=o}}while(0);o=F>>>3;if(F>>>0<256>>>0){z=o<<1;y=352+(z<<2)|0;C=c[78]|0;b=1<<o;do{if((C&b|0)==0){c[78]=C|b;G=y;H=352+(z+2<<2)|0}else{o=352+(z+2<<2)|0;d=c[o>>2]|0;if(d>>>0>=(c[82]|0)>>>0){G=d;H=o;break}ma()}}while(0);c[H>>2]=n;c[G+12>>2]=n;c[n+8>>2]=G;c[n+12>>2]=y;return}y=n;G=F>>>8;do{if((G|0)==0){I=0}else{if(F>>>0>16777215>>>0){I=31;break}H=(G+1048320|0)>>>16&8;z=G<<H;b=(z+520192|0)>>>16&4;C=z<<b;z=(C+245760|0)>>>16&2;o=14-(b|H|z)+(C<<z>>>15)|0;I=F>>>((o+7|0)>>>0)&1|o<<1}}while(0);G=616+(I<<2)|0;c[n+28>>2]=I;c[n+20>>2]=0;c[n+16>>2]=0;o=c[79]|0;z=1<<I;if((o&z|0)==0){c[79]=o|z;c[G>>2]=y;c[n+24>>2]=G;c[n+12>>2]=n;c[n+8>>2]=n;return}if((I|0)==31){J=0}else{J=25-(I>>>1)|0}I=F<<J;J=c[G>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(F|0)){break}K=J+16+(I>>>31<<2)|0;G=c[K>>2]|0;if((G|0)==0){L=126;break}else{I=I<<1;J=G}}if((L|0)==126){if(K>>>0<(c[82]|0)>>>0){ma()}c[K>>2]=y;c[n+24>>2]=J;c[n+12>>2]=n;c[n+8>>2]=n;return}K=J+8|0;L=c[K>>2]|0;I=c[82]|0;if(J>>>0<I>>>0){ma()}if(L>>>0<I>>>0){ma()}c[L+12>>2]=y;c[K>>2]=y;c[n+8>>2]=L;c[n+12>>2]=J;c[n+24>>2]=0;return}function ub(a){a=a|0;var b=0,d=0,e=0;b=(a|0)==0?1:a;while(1){d=ob(b)|0;if((d|0)!=0){e=10;break}a=(C=c[196]|0,c[196]=C+0,C);if((a|0)==0){break}La[a&1]()}if((e|0)==10){return d|0}d=xa(4)|0;c[d>>2]=232;la(d|0,272,4);return 0}function vb(a){a=a|0;return ub(a)|0}function wb(a){a=a|0;if((a|0)==0){return}pb(a);return}function xb(a){a=a|0;wb(a);return}function yb(a){a=a|0;wb(a);return}function zb(a){a=a|0;return}function Ab(a){a=a|0;return 160}function Bb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function Cb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;g=b&3;h=d|d<<8|d<<16|d<<24;i=f&~3;if(g){g=b+4-g|0;while((b|0)<(g|0)){a[b]=d;b=b+1|0}}while((b|0)<(i|0)){c[b>>2]=h;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}return b-e|0}function Db(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function Eb(a,b){a=a|0;b=b|0;return Ka[a&3](b|0)|0}function Fb(a){a=a|0;La[a&1]()}function Gb(a,b,c){a=a|0;b=b|0;c=c|0;return Ma[a&1](b|0,c|0)|0}function Hb(a,b){a=a|0;b=b|0;Na[a&7](b|0)}function Ib(a){a=a|0;ba(0);return 0}function Jb(){ba(1)}function Kb(a,b){a=a|0;b=b|0;ba(2);return 0}function Lb(a){a=a|0;ba(3)}




// EMSCRIPTEN_END_FUNCS
var Ka=[Ib,Ib,Ab,Ib];var La=[Jb,Jb];var Ma=[Kb,Kb];var Na=[Lb,Lb,yb,Lb,zb,Lb,Lb,Lb];return{__ZN17VizGeorefSpline2D9get_pointEddPd:kb,_strlen:Db,__ZN17VizGeorefSpline2D9serializeEPc:mb,_free:pb,_realloc:rb,__ZN17VizGeorefSpline2D11deserializeEPc:nb,__ZN17VizGeorefSpline2D14serialize_sizeEv:lb,_memset:Cb,__ZN17VizGeorefSpline2DD2Ev:fb,_malloc:ob,__ZN17VizGeorefSpline2D9add_pointEddPKd:hb,_memcpy:Bb,__ZN17VizGeorefSpline2D15get_object_sizeEv:gb,__ZN17VizGeorefSpline2D5solveEv:ib,__ZN17VizGeorefSpline2DC2Ei:db,_calloc:qb,runPostSets:cb,stackAlloc:Oa,stackSave:Pa,stackRestore:Qa,setThrew:Ra,setTempRet0:Ua,setTempRet1:Va,setTempRet2:Wa,setTempRet3:Xa,setTempRet4:Ya,setTempRet5:Za,setTempRet6:_a,setTempRet7:$a,setTempRet8:ab,setTempRet9:bb,dynCall_ii:Eb,dynCall_v:Fb,dynCall_iii:Gb,dynCall_vi:Hb}})


// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_ii": invoke_ii, "invoke_v": invoke_v, "invoke_iii": invoke_iii, "invoke_vi": invoke_vi, "_sysconf": _sysconf, "___cxa_throw": ___cxa_throw, "_abort": _abort, "_send": _send, "_fflush": _fflush, "_log": _log, "_fabs": _fabs, "___setErrNo": ___setErrNo, "_fwrite": _fwrite, "_sqrt": _sqrt, "_write": _write, "_llvm_umul_with_overflow_i32": _llvm_umul_with_overflow_i32, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "___cxa_allocate_exception": ___cxa_allocate_exception, "___resumeException": ___resumeException, "___cxa_is_number_type": ___cxa_is_number_type, "___cxa_does_inherit": ___cxa_does_inherit, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "_pwrite": _pwrite, "___cxa_call_unexpected": ___cxa_call_unexpected, "_sbrk": _sbrk, "___errno_location": ___errno_location, "___gxx_personality_v0": ___gxx_personality_v0, "__ZNSt9exceptionD2Ev": __ZNSt9exceptionD2Ev, "_time": _time, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity, "__ZTISt9exception": __ZTISt9exception, "_stderr": _stderr, "__ZTVN10__cxxabiv120__si_class_type_infoE": __ZTVN10__cxxabiv120__si_class_type_infoE }, buffer);
var __ZN17VizGeorefSpline2D9get_pointEddPd = Module["__ZN17VizGeorefSpline2D9get_pointEddPd"] = asm["__ZN17VizGeorefSpline2D9get_pointEddPd"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var __ZN17VizGeorefSpline2D9serializeEPc = Module["__ZN17VizGeorefSpline2D9serializeEPc"] = asm["__ZN17VizGeorefSpline2D9serializeEPc"];
var _free = Module["_free"] = asm["_free"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var __ZN17VizGeorefSpline2D11deserializeEPc = Module["__ZN17VizGeorefSpline2D11deserializeEPc"] = asm["__ZN17VizGeorefSpline2D11deserializeEPc"];
var __ZN17VizGeorefSpline2D14serialize_sizeEv = Module["__ZN17VizGeorefSpline2D14serialize_sizeEv"] = asm["__ZN17VizGeorefSpline2D14serialize_sizeEv"];
var _memset = Module["_memset"] = asm["_memset"];
var __ZN17VizGeorefSpline2DD2Ev = Module["__ZN17VizGeorefSpline2DD2Ev"] = asm["__ZN17VizGeorefSpline2DD2Ev"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var __ZN17VizGeorefSpline2D9add_pointEddPKd = Module["__ZN17VizGeorefSpline2D9add_pointEddPKd"] = asm["__ZN17VizGeorefSpline2D9add_pointEddPKd"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var __ZN17VizGeorefSpline2D15get_object_sizeEv = Module["__ZN17VizGeorefSpline2D15get_object_sizeEv"] = asm["__ZN17VizGeorefSpline2D15get_object_sizeEv"];
var __ZN17VizGeorefSpline2D5solveEv = Module["__ZN17VizGeorefSpline2D5solveEv"] = asm["__ZN17VizGeorefSpline2D5solveEv"];
var __ZN17VizGeorefSpline2DC2Ei = Module["__ZN17VizGeorefSpline2DC2Ei"] = asm["__ZN17VizGeorefSpline2DC2Ei"];
var _calloc = Module["_calloc"] = asm["_calloc"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];

Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };

// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;

// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    applyData(Module['readBinary'](memoryInitializer));
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      applyData(data);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  throw 'abort() at ' + stackTrace();
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}

run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}






//Globalに公開
var global = (function() {return this})();
global['ThinPlateSpline'] = ThinPlateSpline;

return ThinPlateSpline;
})();

if (typeof importScripts === 'function') {
  /* Worker loader */
  var tps = new ThinPlateSpline();
  tps.isWorker = true;

  self.onmessage = function(event) {
    var payload = event.data;
    var method  = payload.method;
    var data    = payload.data;

    self.postMessage({'event':'echo','data':payload});

    switch (method){
      case 'push_points':
        tps.push_points(data);
        self.postMessage({'event':'solved'});
        break;
      case 'load_points':
        var xhr = new XMLHttpRequest();
        xhr.open('GET', data, true);

        xhr.onload = function(e) {
          if (this.status == 200) {
            var points = JSON.parse(this.response);
            tps.push_points(points);
            self.postMessage({'event':'solved'});
          } else {
            self.postMessage({'event':'cannotLoad'});
          }
        };
        xhr.send();
        break;
      case 'deserialize':
        //var serial = JSON.parse(data);
        tps.deserialize(data);
        self.postMessage({'event':'solved'});
        break;
      case 'load_serial':
        var xhr = new XMLHttpRequest();
        xhr.open('GET', data, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function(e) {
          if (this.status == 200) {
            var serial = new Uint8Array(this.response);
            self.postMessage({'event':'serialized','serial':serial});
          } else {
            self.postMessage({'event':'cannotLoad'});
          }
        };
        xhr.send();
        break;
      case 'serialize':
        var serial = tps.serialize();
        self.postMessage({'event':'serialized','serial':serial});
        break;
      case 'transform':
        var coord = data.coord;
        var inv   = data.inv;
        var dst   = tps.transform(coord,inv);
        self.postMessage({'event':'transformed','inv':inv,'coord':dst});
        break;
      case 'echo':
        self.postMessage({'event':'echo'});
        break;
      case 'destruct':
        break;
    }
  };
}

//module.exports = ThinPlateSpline;