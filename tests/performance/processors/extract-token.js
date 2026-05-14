/**
 * Processor para extraer token en Artillery
 */

module.exports = {
  extractToken: (requestParams, context, ee, next) => {
    // Can be used for custom header injection
    next();
  }
};