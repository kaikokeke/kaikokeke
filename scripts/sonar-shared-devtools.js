const scanner = require('sonarqube-scanner');
const packageJson = require('../packages/shared/devtools/package.json');
const getSonarOptions = require('./sonar-utils');

scanner(
  {
    serverUrl: 'https://sonarcloud.io',
    token: process.env.SONAR_TOKEN,
    options: getSonarOptions('shared', packageJson),
  },
  () => process.exit()
);
