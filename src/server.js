const http = require('http');

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      if (!body) {
        return resolve({});
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON payload'));
      }
    });

    req.on('error', reject);
  });
}

const authProvider = {
  authenticate(email, password) {
    return Promise.resolve(email === 'user@example.com' && password === 'password123');
  },
};

function createServer(auth = authProvider) {
  return http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);

    if (req.method === 'POST' && parsedUrl.pathname === '/login') {
      try {
        const body = await parseJsonBody(req);

        if (
          !body ||
          typeof body.email !== 'string' ||
          body.email.trim() === '' ||
          typeof body.password !== 'string' ||
          body.password.trim() === ''
        ) {
          sendJson(res, 400, { error: 'email and password are required' });
          return;
        }

        const valid = await auth.authenticate(body.email, body.password);
        if (!valid) {
          sendJson(res, 401, { error: 'Unauthorized' });
          return;
        }

        sendJson(res, 200, { message: 'Login success' });
      } catch (error) {
        sendJson(res, 400, { error: 'Invalid JSON payload' });
      }
      return;
    }

    res.statusCode = 404;
    res.end('Not Found');
  });
}

module.exports = { createServer, authProvider };
