module.exports = function getSonarOptions(path, pjson) {
  const organization = pjson.name.split('/')[0].substring(1) || 'kaikokeke';
  const projectName = pjson.name.split('/')[1] || '';

  return {
    'sonar.organization': organization,
    'sonar.projectKey': `${organization}:${projectName}`,
    'sonar.projectName': projectName.replace(/^\w/, (n) => n.toUpperCase()),
    'sonar.projectVersion': pjson.version,
    'sonar.projectDescription': pjson.description,
    'sonar.links.homepage': pjson.homepage,
    'sonar.links.issue': pjson.bugs,
    'sonar.scm.provider': pjson.repository.type,
    'sonar.links.scm': pjson.repository.url,
    'sonar.sourceEncoding': 'UTF-8',
    'sonar.sources': `packages/${path}/${projectName}/src`,
    'sonar.exclusions': '**/*.spec.ts,**/*.constant.ts',
    'sonar.coverage.exclusions': '**/*.constant.ts',
    'sonar.typescript.lcov.reportPaths': `coverage/packages/${path}/${projectName}/lcov.info`,
    'sonar.eslint.reportPaths': `lint/${path}-${projectName}.json`,
  };
};
