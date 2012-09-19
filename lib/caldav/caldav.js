(function(global, module) {

  /**
   * Define a list of paths
   * this will only be used in the browser.
   */
  var paths = {};


  /**
   * Exports object is a shim
   * we use in the browser to
   * create an object that will behave much
   * like module.exports
   */
  function Exports(path) {
    this.path = path;
  }

  Exports.prototype = {

    /**
     * Associate and register module.
     *
     * @param {String} path uri associated with module.
     * @param {Object} object module object.
     */
    register: function(path, object) {
      paths[path] = object;
    },

    /**
     * Unified require between browser/node.
     * Path is relative to this file so you
     * will want to use it like this from any depth.
     *
     *
     *   var Leaf = ns.require('sub/leaf');
     *
     *
     * @param {String} path path lookup relative to this file.
     */
    require: function exportRequire(path) {
      if (typeof(window) === 'undefined') {
        return require(require('path').join(__dirname, path));
      } else {
        if (path in paths) {
          return paths[path];
        } else {
          return null;
        }
      }
    },

    /**
     * Maps exports to a file path.
     */
    set exports(val) {
      this.register(this.path, val);
    },

    get exports() {
      return paths[this.path];
    }
  };

  /**
   * Module object constructor.
   *
   *
   *    var module = Module('sub/leaf');
   *    module.exports = function Leaf(){}
   *
   *
   * @constructor
   * @param {String} path file path.
   */
  function Module(path) {
    return new Exports(path);
  }

  Module.register = Exports.prototype.register;
  Module.require = Exports.prototype.require;
  Module.exports = Module;
  Module._paths = paths;

  /**
   * Reference self as exports
   * which also happens to be the constructor
   * so you can assign items to the namespace:
   *
   *    //assign to Module.X
   *    //assume module.exports is Module
   *    module.exports.X = Foo; //Module.X === Foo;
   *    Module.exports('foo'); //creates module.exports object.
   *
   */
  module.exports = Module;

  /**
   * In the browser assign
   * to a global namespace
   * obviously 'Module' would
   * be whatever your global namespace is.
   */
  if (this.window)
    window.Caldav = Module;

}(
  this,
  (typeof(module) === 'undefined') ?
    {} :
    module
));

