/**
 * Tests de Seguridad - OWASP ZAP Integration
 * Configuración y scripts para escaneado de seguridad automatizado
 */

export const ZAP_CONFIG = {
  // ZAP API configuration
  api: {
    host: 'localhost',
    port: 8080,
    apiKey: 'changeme-in-production',
  },

  // Target configuration
  target: {
    url: 'http://localhost:3000',
    context: 'FinCredit API',
  },

  // Scan policies
  policies: {
    // Active scan rules to enable/disable
    activeScanRules: {
      // Enable all rules by default
      '40012': true,  // Cross Site Scripting (Reflected)
      '40014': true,  // Cross Site Scripting (Stored)
      '40016': true,  // Cross Site Scripting (DOM Based)
      '40017': true,  // SQL Injection
      '40018': true,  // SQL Injection (PostgreSQL)
      '40019': true,  // SQL Injection (Blind)
      '40104': true,  // Path Traversal
      '40105': true,  // Remote File Inclusion
      '40106': true,  // Server Side Include Injection
      '40108': true,  // OS Command Injection
      '40112': true,  // Server Side Request Forgery
      '40114': true,  // LDAP Injection
      '40115': true,  // XML External Entity Attack
      '40201': true,  // SOAP Action Spoofing
      '40202': true,  // WSDL File Detection
      '40203': true,  // CORs
      '40205': true,  // Vulnerable JS Library
      '6': true,      // Arbitrary File Upload
    },

    // Test strength and threshold
    strength: 'MEDIUM',    // LOW, MEDIUM, HIGH, INSANE
    threshold: 'MEDIUM',   // LOW, MEDIUM, HIGH, OFF
  },

  // Authentication for scan
  authentication: {
    enabled: true,
    type: 'script', // script-based auth
    script: {
      engine: 'graal.js',
      script: `
        function authenticate(helper, paramsValues, credentials) {
          var request = helper.prepareMessage();
          request.setRequestBody(JSON.stringify({
            email: credentials.getParam("email"),
            password: credentials.getParam("password")
          }));
          request.setHeader("Content-Type", "application/json");
          
          var response = helper.sendAndReceive(request);
          var body = response.getResponseBody().toString();
          
          // Extract token from response
          var token = body.match(/"token":"([^"]+)"/);
          if (token) {
            helper.getHttpSender().setHeader("Authorization", "Bearer " + token[1]);
          }
          
          return true;
        }

        function getRequiredParamsNames() {
          return ["email", "password"];
        }

        function getOptionalParamsNames() {
          return [];
        }

        function getCredentialsParamsNames() {
          return ["email", "password"];
        }
      `,
    },
    credentials: {
      email: 'supervisor@test.com',
      password: 'test123',
    },
  },

  // Session management
  session: {
    type: 'cookie',
  },

  // Reporting
  reporting: {
    formats: ['html', 'json', 'sarif', 'md'],
    outputDir: './tests/security/reports',
    title: 'FinCredit Security Scan Report',
  },

  // Alerts to ignore (false positives)
  falsePositives: [
    // Add known false positive alert IDs here
  ],

  // API endpoints to exclude from scan
  excludeUrls: [
    '/api/health',
    '/metrics',
  ],
};