module.exports = function getSonarOptions(domain, pjson) {
  const organization = pjson.name.includes('@') ? pjson.name?.split('/')[0].substring(1) : 'kaikokeke';
  const name = pjson.name.includes('@') ? pjson.name?.split('/')[1] : pjson.name;

  return {
    'sonar.organization': organization,
    'sonar.projectKey': `${organization}:${name}`,
    'sonar.projectName': name
      .replace(/^\w/, (group) => group.toUpperCase())
      .replace(/-([a-z])/g, (group) => ` ${group[1].toUpperCase()}`),
    'sonar.projectVersion': pjson.version,
    'sonar.projectDescription': pjson.description,
    'sonar.links.homepage': pjson.homepage,
    'sonar.links.issue': pjson.bugs,
    'sonar.scm.provider': pjson.repository?.type,
    'sonar.links.scm': pjson.repository?.url,
    'sonar.sourceEncoding': 'UTF-8',
    'sonar.sources': `packages/${domain}/${name}/src`,
    'sonar.exclusions': '**/*.spec.ts,**/*.constant.ts',
    'sonar.coverage.exclusions': '**/*.constant.ts',
    'sonar.typescript.lcov.reportPaths': `coverage/packages/${domain}/${name}/lcov.info`,
    'sonar.eslint.reportPaths': `lint/${domain}-${name}.json`,
  };
};
