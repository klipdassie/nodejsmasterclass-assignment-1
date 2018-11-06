/*
 * Primary file for API
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const { StringDecoder } = require('string_decoder');
const fs = require('fs');
const config = require('./config');

// Instantiate HTTP Server
const httpServer = http.createServer((req, res) => {
  service(req, res);
});

// Start HTTP Server
httpServer.listen(config.httpPort, config.host, () => {
  console.log(`HTTP Server running at ` +
    `http://${config.host}:${config.httpPort}/ ` +
    `in ${config.envName} mode`);
});

// Instantiate HTTPS Server with options
const httpsOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsOptions, (req, res) => {
  service(req, res);
});

// Start HTTPS Server
httpsServer.listen(config.httpsPort, config.host, () => {
  console.log(`HTTPS Server running at ` +
    `http://${config.host}:${config.httpsPort}/ ` +
    `in ${config.envName} mode`);
});

// Handles request for both the HTTP and HTTPS server
function service(req, res) {
  // Parse URL to get path
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  // Create object containing trimmed path, query, method & header data
  const data = {};
  data.trimmedPath = path.replace(/^\/+|\/+$/g, '');
  data.query = parsedUrl.query;
  data.method = req.method.toUpperCase();
  data.headers = req.headers;

  // Get possible request payload
  const decoder = new StringDecoder('utf8');
  let buffer = '';
  req.on('data', chunk => {
    buffer += decoder.write(chunk);
  });

  // Possible request payload retrieved
  req.on('end', () => {
    buffer += decoder.end();
    data.payload = buffer;

    // Get handler using trimmed path, if exists otherwise use
    // not found handler
    const handler = router[data.trimmedPath] || handlers.notFound;
    handler(data, (statusCode, payload) => {
      // Prepare response by setting statuscode and Content-Type
      res.statusCode = statusCode;
      res.setHeader('Content-Type', 'application/json');

      // Create JSON String using response payload, if exists
      // otherwise use empty object
      const payloadString = JSON.stringify(payload || {});
      res.end(payloadString);
    });

    // Log request data object (used for debugging)
    if (config.envName === 'development') {
      console.log(data);
    }
  });
}

// Handler container
const handlers = {};

// Hello handler
handlers.hello = (data, callback) => {
  callback(200, { msg: 'Hello World!' });
};

// Ping handler
handlers.ping = (data, callback) => {
  callback(200);
};

// Not found handler
handlers.notFound = (data, callback) => {
  callback(404);
};

// Request router
const router = {
  'hello': handlers.hello,
  'ping': handlers.ping
};
