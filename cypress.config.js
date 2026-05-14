const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      return config;
    },
    env: {
      apiUrl: 'http://localhost:3001/api',
      credentials: {
        supervisor: { email: 'admin@fincredit.com', password: 'admin123' },
        empleado: { email: 'juan@fincredit.com', password: 'empleado1' },
        cliente: { email: 'carlos@gmail.com', password: 'cliente1' }
      }
    }
  }
});
