import { test, expect } from '@playwright/test';
import { createServer } from '../../src/server.js';
import type { Server } from 'http';

// Auto-generated from OpenSpec change: login-api

let server: Server;
let baseURL: string;

test.beforeAll(async () => {
  server = createServer();

  await new Promise<void>((resolve, reject) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to determine server port"));
        return;
      }

      baseURL = `http://127.0.0.1:${address.port}`;
      resolve();
    });
    server.on("error", reject);
  });
});

test.afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

test.describe('login-api / user-login', () => {
});

test('Login endpoint accepts email and password - Successful request format', async ({ request }) => {
  const response = await request.post(baseURL + "/login", {
    data: {
      "email": "user@example.com",
      "password": "password123"
},
    headers: { "Content-Type": "application/json" },
  });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ message: "Login success" });
});

test('Successful login response - Valid credentials', async ({ request }) => {
  const response = await request.post(baseURL + "/login", {
    data: {
      "email": "user@example.com",
      "password": "password123"
},
    headers: { "Content-Type": "application/json" },
  });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ message: "Login success" });
});

test('Unauthorized response for invalid credentials - Invalid credentials', async ({ request }) => {
  const response = await request.post(baseURL + "/login", {
    data: {
      "email": "user@example.com",
      "password": "wrong-password"
},
    headers: { "Content-Type": "application/json" },
  });
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
});

test('Invalid request handling - Missing required fields', async ({ request }) => {
  const response = await request.post(baseURL + "/login", {
    data: {
      "email": "user@example.com"
},
    headers: { "Content-Type": "application/json" },
  });
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: "email and password are required" });
});

test('AI-Generated - Edge case: Empty email and password', async ({ request }) => {
  const response = await request.post(baseURL + "/login", {
    data: {
      "email": "",
      "password": ""
},
    headers: { "Content-Type": "application/json" },
  });
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: "email and password are required" });
});

test('AI-Generated - Edge case: Very long email', async ({ request }) => {
  const response = await request.post(baseURL + "/login", {
    data: {
      "email": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@example.com",
      "password": "password123"
},
    headers: { "Content-Type": "application/json" },
  });
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
});

test('AI-Generated - Edge case: SQL injection attempt', async ({ request }) => {
  const response = await request.post(baseURL + "/login", {
    data: {
      "email": "' OR '1'='1",
      "password": "password123"
},
    headers: { "Content-Type": "application/json" },
  });
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
});
