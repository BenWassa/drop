const path = require('path');

module.exports = {
  rootDir: __dirname,
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFilesAfterEnv: [path.join(__dirname, 'jest.setup.js')],
};
