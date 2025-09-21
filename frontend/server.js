const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Create self-signed certificates for development
const httpsOptions = {
  key: fs.existsSync('./certs/key.pem') ? fs.readFileSync('./certs/key.pem') : null,
  cert: fs.existsSync('./certs/cert.pem') ? fs.readFileSync('./certs/cert.pem') : null,
};

app.prepare().then(() => {
  if (httpsOptions.key && httpsOptions.cert) {
    // HTTPS server with certificates
    createServer(httpsOptions, (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(3443, (err) => {
      if (err) throw err;
      console.log('> Ready on https://localhost:3443');
      console.log('> HTTPS enabled for camera access on network devices');
    });
  } else {
    console.log('> HTTPS certificates not found. Run "npm run generate-certs" to create them.');
    console.log('> Falling back to HTTP server...');
    
    // Fallback to HTTP
    const { createServer: createHttpServer } = require('http');
    createHttpServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(3001, (err) => {
      if (err) throw err;
      console.log('> Ready on http://localhost:3001');
      console.log('> Note: Camera may not work on network devices without HTTPS');
    });
  }
});