import { test, expect } from '@playwright/test';
import { createServer } from '../../src/server.js';
import type { Server } from 'http';

let server: Server;
let baseURL: string;

test.describe('Login API', () => {
  test.beforeAll(async () => {
    server = createServer();

    await new Promise<void>((resolve, reject) => {
      server.listen(0, '127.0.0.1', () => {
        const address = server.address();
        if (!address || typeof address === 'string') {
          reject(new Error('Unable to determine server port'));
          return;
        }

        baseURL = `http://127.0.0.1:${address.port}`;
        resolve();
      });
      server.on('error', reject);
    });
  });

  test.afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  test('successful login with valid credentials', async ({ request }) => {
    const response = await request.post(`${baseURL}/login`, {
      data: { email: 'user@example.com', password: 'password123' },
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ message: 'Login success' });
  });

  test('invalid login returns 401', async ({ request }) => {
    const response = await request.post(`${baseURL}/login`, {
      data: { email: 'user@example.com', password: 'wrong-password' },
    });

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
  });

  test('missing email or password returns 400', async ({ request }) => {
    const response = await request.post(`${baseURL}/login`, {
      data: { email: 'user@example.com' },
    });

    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: 'email and password are required' });
  });
});
