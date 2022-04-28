var assert  = require('assert'),
    dns     = require('dns'),
    http    = require('http'),
    net     = require('net'),
    util    = require('util');

function ltrc() { console.log.apply(this, arguments); }

var host_port = 5439;
var host_host = '192.168.57.162';
  //host_host = 'localhost';

var clnt_host = '192.168.57.162';

function bindingAgent(options) {
  http.Agent.call(this, options);
  this.createConnection = bindingCreateConnection;
}
util.inherits(bindingAgent, http.Agent);

function bindingCreateConnection(port, host, options) {
  ltrc('  bindingCreateConnection(%j,%j,%j) called....', port, host, options);

  ltrc('    binding new client socket to %j', clnt_host);
  var socket;
  socket = new net.Socket({ handle: net._createServerHandle(clnt_host)});
  socket.connect(port, host);
  
  socket.marker_of_insanity = 'hiya';

  return socket;
}

var optionsAgent = {};
var ourBindingAgent = new bindingAgent(optionsAgent);

var options = { 'host': host_host, 'port': host_port };

if(1) {
  options.agent = ourBindingAgent;
}

var creq = http.get(options);

creq.on('response', function (res) {
  var socket = creq.connection;
  if(socket) {
    var host_bound_addr = {'address': socket.remoteAddress, 'port': socket.remotePort};
    ltrc('Server address %j', host_bound_addr);

    var clnt_bound_addr = socket.address();
    ltrc('Client address %j', clnt_bound_addr);

    ltrc('(insanity:  %j)', socket.marker_of_insanity ? 'yes' : 'no');
  }

  ltrc('Resp  STATUS: %j', res.statusCode);

  var headers = res.headers;
  var keys = Object.keys(headers);

  ltrc('    HEADERS:  (%d)', keys.length);

  for(var idx=0, l=keys.length; idx < l ; idx++) {
    var key = keys[idx];
    ltrc(' %j %j', key, headers[key]);
  }

  res.setEncoding('utf8');

  res.on('data', function (chunk) {
    ltrc('DATA: %j', chunk);
  });
});

creq.on('error', function (err) {
  ltrc('Resp  ERROR: %j', err.message);
});