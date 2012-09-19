(function(module, ns) {

  var exports = module.exports;

  exports.Responder = ns.require('responder');
  exports.Sax = ns.require('sax');
  exports.Template = ns.require('template');
  exports.Xhr = ns.require('xhr');
  exports.Request = ns.require('request');
  exports.Templates = ns.require('templates');
  exports.Connection = ns.require('connection');
  exports.Resources = ns.require('resources');

}.apply(
  this,
  (this.Caldav) ?
    [Caldav, Caldav] :
    [module, require('./caldav')]
));
