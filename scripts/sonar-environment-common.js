const scanner = require('sonarqube-scanner');
const packageJson = require('../packages/environment/common/package.json');
const getSonarOptions = require('./sonar-utils');

scanner(
  {
    serverUrl: 'https://sonarcloud.io',
    token: process.env.SONAR_TOKEN,
    options: getSonarOptions('environment', packageJson),
  },
  () => process.exit(),
);
