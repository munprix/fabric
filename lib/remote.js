'use strict';

var crypto = require('crypto');
var util = require('util');
var rest = require('wreck');

var _ = require('./functions');

const CONTENT_TYPE = 'application/json';

/**
 * An in-memory representation of a node in our network.
 * @exports Remote
 * @type {Vector}
 * @param       {Object} initial - Target object.
 * @constructor
 */
function Remote (init) {
  this['@data'] = init || {};

  this.clock = 0;
  this.stack = [];
  this.known = {};

  this.secure = (init.secure) ? true : false;

  this.init();
}

util.inherits(Remote, require('./vector'));

Remote.prototype.enumerate = async function () {
  var self = this;
  var options = await self._OPTIONS('/');

  if (!options) {
    console.log('nothing:', options);
    return [];
  }
  
  options.resources = options.resources.map(function(r) {
    return {
      name: r.name,
      description: r.description,
      components: _.merge({
        query: 'maki-resource-query',
        get: 'maki-resource-get'
      }, r.components),
      routes: r.routes,
      attributes: r.attributes,
      names: r.names,
    }
  });
  
  return options.resources;
}

/**
 * HTTP PUT against the configured Authority.
 * @param  {String} path - HTTP Path to request.
 * @param  {Object} obj - Map of parameters to supply.
 * @return {Mixed}        [description]
 */
Remote.prototype._PUT = async function (key, obj) {
  var self = this;
  var host = self['@data'].host;
  var protocol = (!self.secure) ? 'http' : 'https';
  var url = protocol + '://' + host + key;

  var result = null;

  try {
    let response = await rest.request('PUT', url, {
      headers: {
        'Accept': CONTENT_TYPE
      },
      payload: obj
    });

    console.log('[REMOTE]', '_PUT', key, obj, typeof response, response.length);
    result = await rest.read(response, {
      json: true
    });

    console.log('[REMOTE]', '_PUT', 'response:', key, typeof result, result);
  } catch (e) {
    console.error('[REMOTE]', 'exception:', e);
  }

  return result;
};

/**
 * HTTP GET against the configured Authority.
 * @param  {String} path - HTTP Path to request.
 * @param  {Object} params - Map of parameters to supply.
 * @return {Mixed}        [description]
 */
Remote.prototype._GET = async function (key, params) {
  var self = this;
  var host = self['@data'].host;
  var protocol = (!self.secure) ? 'http' : 'https';
  var url = protocol + '://' + host + key;

  try {
    var response = await rest.request('GET', url, {
      headers: {
        'Accept': CONTENT_TYPE
      }
    });
    var result = await rest.read(response, {
      json: true
    });
  } catch (e) {
    console.error('[REMOTE]', 'exception:', e);
  }

  return result;
};

/**
 * HTTP POST against the configured Authority.
 * @param  {String} path - HTTP Path to request.
 * @param  {Object} params - Map of parameters to supply.
 * @return {Mixed}        [description]
 */
Remote.prototype._POST = async function (key, obj, params) {
  var self = this;
  var host = self['@data'].host;
  var protocol = (!self.secure) ? 'http' : 'https';
  var url = protocol + '://' + host + key;

  console.log('[REMOTE]', 'posting:', key, obj);

  try {
    var response = await rest.request('POST', url, {
      headers: {
        'Accept': CONTENT_TYPE
      },
      payload: obj,
      redirect303: true
    });
    var result = await rest.read(response, {
      json: true
    });

    console.log('output:', result);

  } catch (e) {
    console.error('[REMOTE]', 'exception:', e);
  }

  return result;
};

/**
 * HTTP OPTIONS on the configured Authority.
 * @param  {String} path - HTTP Path to request.
 * @param  {Object} params - Map of parameters to supply.
 * @return {Object} - Full description of remote resource.
 */
Remote.prototype._OPTIONS = async function (key, params) {
  var self = this;
  var host = self['@data'].host;
  var protocol = (!self.secure) ? 'http' : 'https';
  var url = protocol + '://' + host + key;

  try {
    var response = await rest.request('OPTIONS', url, {
      headers: {
        'Accept': CONTENT_TYPE
      }
    });
    var result = await rest.read(response, {
      json: true
    });
  } catch (e) {
    console.error('[REMOTE]', 'exception:', e);
  }

  return result;
};

Remote.prototype._PATCH = async function (key, params) {
  var self = this;
  var host = self['@data'].host;
  var protocol = (!self.secure) ? 'http' : 'https';
  var url = protocol + '://' + host + key;

  try {
    var response = await rest.request('PATCH', url, {
      headers: {
        'Accept': CONTENT_TYPE
      },
      payload: params
    });
    var result = await rest.read(response, {
      json: true
    });
  } catch (e) {
    console.error('[REMOTE]', 'exception:', e);
  }

  return result;
};

module.exports = Remote;
