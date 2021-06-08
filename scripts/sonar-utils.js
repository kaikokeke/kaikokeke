function getOrganization(pjson) {
  const nameArray = pjson.name.split('/');
  return nameArray[0]?.substring(1) || 'kaikokeke';
}

function getProjectName(pjson) {
  const nameArray = pjson.name.split('/');
  return nameArray[1] || '';
}

module.exports = function getProjectInfo(path, pjson) {
  console.log('pjson', path, pjson);

  return {
    'sonar.organization': getOrganization(pjson),
    'sonar.projectKey': `${getOrganization(pjson)}:${getProjectName(pjson)}`,
    'sonar.projectName': getProjectName(pjson).replace(/^\w/, (n) => n.toUpperCase()),
    'sonar.projectVersion': pjson.version,
    'sonar.projectDescription': pjson.description,
    'sonar.links.homepage': pjson.homepage,
    'sonar.links.issue': pjson.bugs,
    'sonar.scm.provider': pjson.repository.type,
    'sonar.links.scm': pjson.repository.url,
    'sonar.sourceEncoding': 'UTF-8',
    'sonar.sources': `packages/${path}/${getProjectName(pjson)}/src`,
    'sonar.exclusions': '**/*.spec.ts,**/*.constant.ts',
    'sonar.coverage.exclusions': '**/*.constant.ts',
    'sonar.typescript.lcov.reportPaths': `coverage/packages/${path}/${getProjectName(pjson)}/lcov.info`,
  };
};
