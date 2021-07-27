const { getJestProjects } = require('@nrwl/jest');

module.exports = {
  projects: [
    ...getJestProjects(),
    '<rootDir>/packages/shared/devtools',
    '<rootDir>/packages/shared/common',
    '<rootDir>/packages/shared/common-angular',
    '<rootDir>/packages/environment/common',
    '<rootDir>/apps/angular',
  ],
};
