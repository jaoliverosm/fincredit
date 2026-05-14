/**
 * Tests de Performance con k6 (alternativa a Artillery)
 * Script de carga para endpoints principales
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loginTrend = new Trend('login_duration');
const readTrend = new Trend('read_operations_duration');
const writeTrend = new Trend('write_operations_duration');

// Test configuration
export const options = {
  // Stages: ramp-up, sustain, ramp-down
  stages: [
    { duration: '30s', target: 10 },   // Warm-up
    { duration: '1m', target: 20 },    // Sustained
    { duration: '30s', target: 50 },   // Stress
    { duration: '1m', target: 50 },    // Peak
    { duration: '30s', target: 0 },    // Cool-down
  ],

  // Thresholds
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.05'],
    errors: ['rate<0.05'],
    checks: ['rate>0.95'],
  },

  // RPS limit
  rps: 50,
};

// Base URL
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Helper: login and get token
function login(email, password) {
  const start = Date.now();
  const res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email,
    password,
  }), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'login' },
  });
  const duration = Date.now() - start;
  loginTrend.add(duration);

  check(res, {
    'login successful': (r) => r.status === 200,
    'has token': (r) => r.json('data.token') !== undefined,
  }) || errorRate.add(1);

  return res.json('data.token');
}

// Helper: authenticated request
function authRequest(url, method, token, body = null) {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const params = { headers, tags: { name: url } };
  const start = Date.now();

  let res;
  if (method === 'GET') {
    res = http.get(`${BASE_URL}${url}`, params);
  } else if (method === 'POST') {
    res = http.post(`${BASE_URL}${url}`, JSON.stringify(body), params);
  } else if (method === 'PUT') {
    res = http.put(`${BASE_URL}${url}`, JSON.stringify(body), params);
  }

  const duration = Date.now() - start;
  if (url.includes('prestamos') || url.includes('ventas')) {
    writeTrend.add(duration);
  } else {
    readTrend.add(duration);
  }

  return res;
}

// Default export - main test suite
export default function () {
  group('Authentication', function () {
    const token = login('empleado@test.com', 'test123');

    if (!token) {
      errorRate.add(1);
      return;
    }

    group('Read Operations', function () {
      // Dashboard
      let res = authRequest('/dashboard/empleado', 'GET', token);
      check(res, {
        'dashboard OK': (r) => r.status === 200,
      }) || errorRate.add(1);
      sleep(0.5);

      // Préstamos
      res = authRequest('/prestamos', 'GET', token);
      check(res, {
        'prestamos OK': (r) => r.status === 200,
      }) || errorRate.add(1);
      sleep(0.5);

      // Clientes
      res = authRequest('/clientes', 'GET', token);
      check(res, {
        'clientes OK': (r) => r.status === 200,
      }) || errorRate.add(1);
      sleep(0.5);

      // Artículos
      res = authRequest('/articulos', 'GET', token);
      check(res, {
        'articulos OK': (r) => r.status === 200,
      }) || errorRate.add(1);
      sleep(0.5);

      // Pagos
      res = authRequest('/pagos', 'GET', token);
      check(res, {
        'pagos OK': (r) => r.status === 200,
      }) || errorRate.add(1);
      sleep(0.5);
    });

    group('Write Operations', function () {
      // Create loan
      const loanData = {
        clienteId: 1,
        monto: Math.floor(Math.random() * 5000000) + 100000,
        interes: Math.floor(Math.random() * 15) + 5,
        cuotas: [6, 12, 18, 24][Math.floor(Math.random() * 4)],
      };
      let res = authRequest('/prestamos', 'POST', token, loanData);
      check(res, {
        'create loan OK': (r) => r.status === 201,
      }) || errorRate.add(1);
      sleep(1);

      // Create sale
      const saleData = {
        clienteId: 1,
        articuloId: Math.floor(Math.random() * 20) + 1,
        cantidad: Math.floor(Math.random() * 5) + 1,
        cuotas: [3, 6, 12][Math.floor(Math.random() * 3)],
        interes: 15,
      };
      res = authRequest('/ventas', 'POST', token, saleData);
      check(res, {
        'create sale OK': (r) => r.status === 201,
      }) || errorRate.add(1);
      sleep(1);
    });
  });
}