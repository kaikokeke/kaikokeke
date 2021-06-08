const scanner = require('sonarqube-scanner');
const pjson = require('../packages/shared/devtools/package.json');
const getProjectInfo = require('./sonar-utils');

scanner(
  {
    serverUrl: 'https://sonarcloud.io',
    token: process.env.SONAR_TOKEN,
    options: getProjectInfo('shared', pjson),
  },
  () => process.exit()
);
